import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
const commentsController = require('../controllers/commentController');
const router = express.Router();
import { IUser } from 'src/types/models';


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
router.put("/:id([a-zA-Z0-9]{24})", commentsController.comment_update);

// DELETE a single comment
router.delete("/:id([a-zA-Z0-9]{24})", commentsController.comment_delete);

module.exports = router;
