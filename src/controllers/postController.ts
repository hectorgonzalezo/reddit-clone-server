import Post from "../models/postModel";
import url from 'url';
import Community from "../models/communityModel";
import { QueryOptions } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { IPost } from "src/types/models";

// List all posts in database
exports.posts_list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const community = req.query.community;
    let posts: IPost[];
    // if url has the community query string, look for posts only in that community
    if (community !== undefined) {
      // look if community exists
      const existingCommunity = await Community.findById(community, {
        _id: 1,
      });
      if (existingCommunity === null) {
        return res
          .status(404)
          .send({ error: `No community with id ${community} found` }); 
      }
      // if it does, look for posts inside that community
      posts = await Post.find({ community }).populate({ path: "community", select: "name users posts icon" }).populate("user", "username");
    } else {
      posts = await Post.find().populate({ path: "community", select: "name users posts icon" }).populate("user", "username");
    }
    return res.status(200).send({ posts });
  } catch (error) {
    return next(error);
  }
};

// Display details about an individual post
// GET post
exports.post_detail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "user"
    ).populate({ path: "community", select: "name users posts icon" }).populate("user", "username");
    if (post === null) {
      return res
        .status(404)
        .send({ error: `No post with id ${req.params.id} found` });
    }
    return res.status(200).send({ post });
  } catch (error) {
    return next(error);
  }
};

// create an individual post
// POST post
exports.post_create = [
  body("title", "Post title is required")
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage("Post title must be between 3 and 300 characters long"),
  body("text")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Post text can't be empty"),
  body("community")
    .trim()
    .escape()
    .custom(async (value) => {
      // Look for community in database
      const existingCommunity = await Community.findById(value);
      // If it doesn't exist, show error
      if (existingCommunity === null) {
        return Promise.reject();
      }
    })
    .withMessage("Community doesn't exist"),
  body("url")
    .optional()
    .trim()
    .isURL()
    .withMessage("URL isn't valid"),
  body("imageUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image URL isn't valid"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      const post = {
        title: req.body.title,
        text: req.body.text,
        community: req.body.community,
        user: req.body.userId,
        upVotes: 0,
        comments: [],
      } as IPost;
      // add url if there's one
      if (req.body.url !== '') {
        post.url = req.body.url;
      } 
      // add imageUrl if there's one
      if (req.body.imageUrl !== '') {
        post.imageUrl = req.body.imageUrl;
      } 

      // Create a new post
      const newPost = new Post(post);

      // Save it to database
      const savedPost = await newPost.save();

      return res.send({ post: savedPost });
    } catch (err) {
      return next(err);
    }
  },
];

// Update an individual post
// PUT post
exports.post_update = [
  body("title", "Post title is required")
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage("Post title must be between 3 and 300 characters long"),
  body("text", "Post text is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Post text can't be empty"),
  body("community", "A community is required")
    .optional()
    .trim()
    .escape()
    .custom(async (value) => {
      // Look for community in database
      const existingCommunity = await Community.findById(value);
      // If it doesn't exist, show error
      if (existingCommunity === null) {
        return Promise.reject();
      }
    })
    .withMessage("Community doesn't exist"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      let previousPost: IPost;
      // Get upvotes and comments from previous entry
      previousPost = (await Post.findById(req.params.id, {
        community: 1,
        upVotes: 1,
        comments: 1,
      })) as IPost;

      if (previousPost === null) {
        // If no community is found, send error;
        return res
          .status(404)
          .send({ error: `No post with id ${req.params.id} found` });
      }

      // Create a new post
      const newPost = new Post({
        title: req.body.title,
        text: req.body.text,
        community: previousPost.community,
        user: req.body.userId,
        upVotes: previousPost.upVotes,
        comments: previousPost.comments,
        _id: req.params.id,
      });

      // option to return updated post
      const updateOptions: QueryOptions & { rawResult: true } = {
        new: true,
        upsert: true,
        rawResult: true,
      };

      // Update post in database
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        newPost,
        updateOptions
      );
      return res.send({ post: updatedPost.value });
    } catch (err) {
      return next(err);
    }
  },
];

// DELETE post
exports.post_delete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    // if post doesn't exist, send error
    if (post === null) {
      return res
        .status(404)
        .send({ error: `No post with id ${req.params.id} found` });
    }
    return res.send({ msg: `Post ${req.params.id} deleted` });
  } catch (err) {
    return next(err);
  }
};
