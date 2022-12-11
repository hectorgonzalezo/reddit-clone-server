const Post = require('../models/postModel');
import { Request, Response } from 'express';

// List all posts in database
exports.posts_list = (req: Request, res: Response) => {
  res.send({ posts: "posts" });
};

// Display details about an individual post
// GET post
exports.post_detail = (req: Request, res: Response) => {
  res.send({ post: `Post ${req.params.id}` });
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
