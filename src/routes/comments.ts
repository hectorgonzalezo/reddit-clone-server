import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import Comment from "../models/commentModel";
const commentsController = require("../controllers/commentController");
const router = express.Router();
import { IUser } from "src/types/models";

// GET all comments
router.get("/", commentsController.comments_list);

// GET a single comment
router.get("/:id([a-zA-Z0-9]{24})", commentsController.comment_detail);

// POST/create a single comment
router.post(
  "/",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      (err: any, user: IUser) => {
        if (err || !user) {
          // if user is not authorized
          return res.status(403).send({
            errors: [
              {
                msg: "Only logged in users can add comments",
              },
            ],
          });
        }
        req.body.userId = user._id?.toString();
        return next();
      }
    )(req, res, next);
  },
  commentsController.comment_create
);

// PUT/update a single comment
router.put(
  "/:id([a-zA-Z0-9]{24})",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err: any, user: IUser) => {
        const comment = await Comment.findById(req.params.id, { user: 1 });
        if (comment === null) {
          // If no community is found, send error;
          return res
            .status(404)
            .send({ error: `No comment with id ${req.params.id} found` });
        }
        const commentUser = comment?.user as IUser;
        const isUserCreator = commentUser._id?.toString() === user._id?.toString();
        const isUserAdmin = user.permission === "admin";
        if (err || !user || (!isUserCreator && !isUserAdmin)) {
          // if user is not admin, return error
          return res.status(403).send({
            errors: [
              {
                msg: "Only the comment creator can update it",
              },
            ],
          });
        }
        req.body.userId = user._id?.toString();
        return next();
      }
    )(req, res, next);
  },
  commentsController.comment_update
);

// DELETE a single comment
router.delete(
  "/:id([a-zA-Z0-9]{24})",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err: any, user: IUser) => {
        const comment = await Comment.findById(req.params.id, { user: 1 });
        if (comment === null) {
          // If no community is found, send error;
          return res
            .status(404)
            .send({ error: `No comment with id ${req.params.id} found` });
        }
        
        const commentUser = comment?.user as IUser;
        const isUserCreator = commentUser._id?.toString() === user._id?.toString();
        const isUserAdmin = user.permission === "admin";
        if (err || !user || (!isUserCreator && !isUserAdmin)) {
          // if user is not admin, return error
          return res.status(403).send({
            errors: [
              {
                msg: "Only the comment creator can delete it",
              },
            ],
          });
        }
        req.body.userId = user._id?.toString();
        return next();
      }
    )(req, res, next);
  },
  commentsController.comment_delete
);

module.exports = router;
