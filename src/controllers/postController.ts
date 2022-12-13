import Post from '../models/postModel';
import { Request, Response, NextFunction } from 'express';

// List all posts in database
exports.posts_list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await Post.find(); 
    return res.status(200).send({ posts });
  } catch (error) {
    return next(error);
  }
};

// Display details about an individual post
// GET post
exports.post_detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id); 
    if (post === null) {
      return res.status(404).send({ error: `No post with id ${req.params.id} found` });
    }
    return res.status(200).send({ post });
  } catch (error) {
    return next(error);
  }
};

// create an individual post
// POST post
exports.post_create = (req: Request, res: Response) => {
  res.send({ post: `Post created` });
};

// Update an individual post
// PUT post
exports.post_update = (req: Request, res: Response) => {
  res.send({ post: `Post ${req.params.id} updated` });
};

// Display details about an individual post
// DELETE post
exports.post_delete = (req: Request, res: Response) => {
  res.send({ post: `Post ${req.params.id} deleted` });
};
