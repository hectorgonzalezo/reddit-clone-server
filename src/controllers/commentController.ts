import Comment from '../models/commentModel';
import Post from '../models/postModel';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ExtendedRequest } from 'src/types/extendedRequest';
import { IComment, IPost } from 'src/types/models';
import { QueryOptions } from 'mongoose';

// List all comments in database
exports.comments_list = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    // Look for post and extract comments
    const { comments } = (await Post.findById(req.postId, {
      comments: 1,
    }).populate({
      path: "comments",
      populate: { path: "responses", model: "Comment" },
    })) as IPost;
    // console.log(comments)
    return res.status(200).send({ comments });
  } catch (error) {
    return next(error);
  }
};

// Display details about an individual comment
// GET comment
exports.comment_detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = await Comment.findById(req.params.id); 
    if (comment === null) {
      return res.status(404).send({ error: `No comment with id ${req.params.id} found` });
    }
    return res.status(200).send({ comment });
  } catch (error) {
    return next(error);
  }
};

// create an individual comment
// comment comment
exports.comment_create = [
  body("text", "Comment text is required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Comment text can't be empty"),
  body("parent")
    .optional()
    .trim()
    .escape()
    .custom(async (value) => {
      // Look for community in database
      const existingCommunity = await Comment.findById(value);
      // If it doesn't exist, show error
      if (existingCommunity === null) {
        return Promise.reject();
      }
    })
    .withMessage("Parent comment doesn't exist"),
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      // Create a new comment
      const newComment = new Comment({
        text: req.body.text,
        user: req.body.userId,
        upVotes: 0,
        responses: [],
      });

      // Save it to database
      const savedComment = await newComment.save();

      // If there's a parent, add comment to it, otherwise add to post
      if (req.body.parent === undefined) {
        // add comment to post
        await Post.findByIdAndUpdate(req.postId, {
          $push: { comments: savedComment._id },
        });
      } else {
        // add comment to previous comment
        await Comment.findByIdAndUpdate(req.body.parent, {
          $push: { responses: savedComment._id },
        }); 
      }

      return res.send({ comment: savedComment });
    } catch (err) {
      return next(err);
    }
  },
];

// Update an individual comment
// PUT comment
exports.comment_update = [
  body("text", "Comment text is required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Comment text can't be empty"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      let previousComment: IComment;
      // Get upVotes and responses from previous entry
      previousComment = (await Comment.findById(req.params.id, {
        upVotes: 1,
        responses: 1,
      })) as IComment;

      if (previousComment === null) {
        // If no community is found, send error;
        return res
          .status(404)
          .send({ error: `No comment with id ${req.params.id} found` });
      }

      // Create a new comment
      const newComment = new Comment({
        text: req.body.text,
        user: req.body.userId,
        upVotes: previousComment.upVotes,
        responses: previousComment.responses,
        _id: req.params.id,
      });

      // option to return updated comment
      const updateOptions: QueryOptions & { rawResult: true } = {
        new: true,
        upsert: true,
        rawResult: true,
      };

      // Update comment in database
      const updatedComment = await Comment.findByIdAndUpdate(
        req.params.id,
        newComment,
        updateOptions
      );
      return res.send({ comment: updatedComment.value });
    } catch (err) {
      return next(err);
    }
  },
];

// Display details about an individual comment
// DELETE comment
exports.comment_delete = (req: Request, res: Response) => {
  res.send({ comment: `Comment ${req.params.id} deleted` });
};
