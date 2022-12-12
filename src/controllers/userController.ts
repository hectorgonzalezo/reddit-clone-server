import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from "express-validator";
import User from '../models/userModel';
import { IUser } from 'src/types/models';

const TOKEN_EXPIRATION = "24h";

// Display details about an individual user
// GET user
exports.user_detail = async (req: Request, res: Response, next: NextFunction) => {
  res.send({ user: `User ${req.params.id}` });
  try {
    const user = await User.findById(req.params.id, { username: 1 });
    // return queried user as json
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// Log in user
exports.user_log_in = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 25 })
    .escape()
    .withMessage("Username must be between 3 and 25 characters long"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }
    passport.authenticate(
      "local",
      { session: false },
      (err: Error, user: IUser) => {
        if (err || !user) {
          console.log(err)
          return res.status(400).json({
            errors:[{ msg: "Incorrect username or password" }],
            user,
          });
        }
        req.login(user, { session: false }, (loginErr: any) => {
          if (loginErr) {
            res.send(loginErr);
          }
          // generate a signed son web token with the contents of user object and return it in the response
          // user must be converted to JSON
          const token = jwt.sign(
            user.toJSON(),
            process.env.AUTH_SECRET as string,
            { expiresIn: TOKEN_EXPIRATION }
          );
          return res.json({ user, token });
        });
      }
    )(req, res);
  },
];

// Sign up user
exports.user_sign_up = [
  body("username", "Username is required")
    .trim()
    .isLength({ min: 3, max: 25 })
    .escape()
    .withMessage("Username must be between 3 and 25 characters long"),
  body("email", "Email is required")
    .trim()
    .isEmail()
    .withMessage("Invalid email"),
  body("password", "Password is required")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("passwordConfirm", "Password confirmation is required")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords don't match"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }
    // If its valid
    try {
      // encrypt password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      // look in db for a user with the same username
      const existingUser = await User.find({ username: req.body.username });

      // if one exists, send error
      if (existingUser.length !== 0) {
        // return error and user data filled so far
        return res.status(400).send({
          errors: [{ msg: "Username already exists", user: req.body }],
        });
      }

      // look in db for a user with the same email
      const existingEmail = await User.find({ email: req.body.email });

      // if one exists, send error
      if (existingEmail.length !== 0) {
        // return error and user data filled so far
        return res.status(400).send({
          errors: [{ msg: "Email already exists", user: req.body }],
        });
      }

      // if no user exists with provided username, create one
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        permission: "regular",
      } as IUser);
      // and save it to database
      await newUser.save();

      // generate a signed son web token with the contents of user object and return it in the response
      // user must be converted to JSON
      const token = jwt.sign(
        newUser.toJSON(),
        process.env.AUTH_SECRET as string,
        { expiresIn: TOKEN_EXPIRATION }
      );
      return res.json({ user: newUser, token });
    } catch (err) {
      return next(err);
    }
  },
];

// Update an individual user
// PUT user
exports.user_update = (req: Request, res: Response) => {
  res.send({ user: `User ${req.params.id} updated` });
};

// Display details about an individual user
// DELETE user
exports.user_delete = (req: Request, res: Response) => {
  res.send({ user: `User ${req.params.id} deleted` });
};
