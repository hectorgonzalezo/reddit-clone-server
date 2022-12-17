import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
const usersController = require("../controllers/userController");
const router = express.Router();
import { IUser } from "src/types/models";
require("../passport");

// GET a single user
// only if user is authorized
router.get("/:id([a-zA-Z0-9]{24})", usersController.user_detail);

// voting
router.put(
  "/:userId([a-zA-Z0-9]{24})/vote/:postId([a-zA-Z0-9]{24})",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err: any, user: IUser) => {
        if (err || !user || user._id?.toString() !== req.params.userId) {
          // return error, if user is not authorized 
          // or is trying to vote for someone else
          return res.status(403).send({
            errors: [
              {
                msg: "Only the user itself can vote",
              },
            ],
          });
        }
        // if the users isn't the creator of community, send error
        req.body.userId = user._id?.toString();
        return next();
      }
    )(req, res, next);
  },
  usersController.user_vote
);

// Log user in
router.post("/log-in", usersController.user_log_in);

// Sign user up
router.post("/sign-up", usersController.user_sign_up);

// PUT/update a single user
router.put(
  "/:id([a-zA-Z0-9]{24})",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err: any, user: IUser) => {
        if (
          err ||
          !user ||
          (user._id?.toString() !== req.params.id &&
            user.permission !== "admin")
        ) {
          // return error, if user is not authorized
          // or is trying to vote for someone else
          return res.status(403).send({
            errors: [
              {
                msg: "Only the user itself can update it",
              },
            ],
          });
        }
        // if the users isn't the creator of community, send error
        req.body.userId = user._id?.toString();
        return next();
      }
    )(req, res, next);
  },
  usersController.user_update
);

// DELETE a single user
router.delete(
  "/:id([a-zA-Z0-9]{24})",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      (err: any, user: IUser) => {
        if (err) {
          return next(err);
        }
        // Only show users if user is administrator
        if (user.permission === "admin") {
          next();
        } else {
          // if user is not admin, return error
          res.status(403).send({
            errors: [
              {
                msg: "Only administrators can delete users",
              },
            ],
          });
        }
      }
    )(req, res, next);
  },
  usersController.user_delete
);

module.exports = router;
