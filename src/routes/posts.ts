import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import Post from '../models/postModel';
const postsController = require('../controllers/postController');
const router = express.Router();
import { IUser } from 'src/types/models';

// GET all posts
router.get("/", postsController.posts_list);

// GET a single post
router.get("/:id([a-zA-Z0-9]{24})", postsController.post_detail);

// POST/create a single post
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
                msg: "Only logged in users can create posts",
              },
            ],
          });
        }
        req.body.userId = user._id?.toString();
        return next();
      }
    )(req, res, next);
  },
  postsController.post_create
);

// PUT/update a single post
router.put(
  "/:id([a-zA-Z0-9]{24})",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err: any, user: IUser) => {
        const post = await Post.findById(req.params.id);
        const isUserCreator =
          post?.user.toString() === user._id?.toString();
        const isUserAdmin = user.permission === "admin";
        if (err || !user || (!isUserCreator && !isUserAdmin)) {
          // if user is not admin, return error
          return res.status(403).send({
            errors: [
              {
                msg: "Only the post creator can update the post",
              },
            ],
          });
        }
        req.body.userId = user._id?.toString();
        return next();
      }
    )(req, res, next);
  },
  postsController.post_update
);

// DELETE a single post
router.delete(
  "/:id([a-zA-Z0-9]{24})",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err: any, user: IUser) => {
        const post = await Post.findById(req.params.id);
        const isUserCreator = post?.user.toString() === user._id?.toString();
        const isUserAdmin = user.permission === "admin";
        if (err || !user || (!isUserCreator && !isUserAdmin)) {
          // if user is not admin, return error
          return res.status(403).send({
            errors: [
              {
                msg: "Only the post creator can delete the post",
              },
            ],
          });
        }
        req.body.userId = user._id?.toString();
        return next();
      }
    )(req, res, next);
  },
  postsController.post_delete
);

module.exports = router;
