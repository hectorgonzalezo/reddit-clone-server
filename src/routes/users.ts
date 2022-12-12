import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
const usersController = require('../controllers/userController');
const router = express.Router();
import { IUser } from 'src/types/models';
require("../passport");

// GET a single user
// only if user is authorized
router.get(
  "/:id",
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
                msg: "Only administrators can get info about users",
              },
            ],
          });
        }
      }
    )(req, res, next);
  },
  usersController.user_detail
);

// Log user in
router.post("/log-in", usersController.user_log_in);

// Sign user up
router.post("/sign-up", usersController.user_sign_up);

// PUT/update a single user
router.put("/:id", usersController.user_update);

// DELETE a single user
router.delete("/:id", usersController.user_delete);

module.exports = router;
