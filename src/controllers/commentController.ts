import Comment from '../models/commentModel';
import Post from '../models/postModel';
import { Request, Response, NextFunction } from 'express';
import { ExtendedRequest } from 'src/types/extendedRequest';
import { IPost } from 'src/types/models';

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
