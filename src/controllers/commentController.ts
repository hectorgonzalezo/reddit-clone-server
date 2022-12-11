const Comment = require('../models/commentModel');
import { Request, Response } from 'express';

// List all comments in database
exports.comments_list = (req: Request, res: Response) => {
  res.send({ comments: "comments" });
};

// Display details about an individual comment
// GET comment
exports.comment_detail = (req: Request, res: Response) => {
  res.send({ comment: `Comment ${req.params.id}` });
};

// create an individual comment
// comment comment
exports.comment_create = (req: Request, res: Response) => {
  res.send({ comment: `Comment created` });
};

// Update an individual comment
// PUT comment
exports.comment_update = (req: Request, res: Response) => {
  res.send({ comment: `Comment ${req.params.id} updated` });
};

// Display details about an individual comment
// DELETE comment
exports.comment_delete = (req: Request, res: Response) => {
  res.send({ comment: `Comment ${req.params.id} deleted` });
};
