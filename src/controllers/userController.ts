import { NextFunction, Request, Response } from "express";
import { QueryOptions } from "mongoose";
import passport from "passport";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/userModel";
import Post from '../models/postModel';
import { IUser } from "src/types/models";

const TOKEN_EXPIRATION = "24h";

// Display details about an individual user
// GET user
exports.user_detail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id, {
      username: 1,
      icon: 1,
      createdAt: 1,
      communities: 1,
      votes: 1,
    }).populate("communities");
    // return queried user as json
    return res.json({ user });
  } catch (err) {
    return next(err);
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
          return res.status(400).json({
            errors: [{ msg: "Incorrect username or password" }],
            user,
          });
        }
        req.login(user, { session: false }, (loginErr: any) => {
          if (loginErr) {
            return next(loginErr);
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
        communities: [],
        votes: {},
      } as IUser);
      // and save it to database
      const user = await newUser.save();

      // generate a signed son web token with the contents of user object and return it in the response
      // user must be converted to JSON
      const token = jwt.sign(
        newUser.toJSON(),
        process.env.AUTH_SECRET as string,
        { expiresIn: TOKEN_EXPIRATION }
      );
      return res.json({ user, token });
    } catch (err) {
      return next(err);
    }
  },
];

// Update an individual user
// PUT user
exports.user_update = [
  body("username", "Username is required")
    .optional()
    .trim()
    .isLength({ min: 3, max: 25 })
    .escape()
    .withMessage("Username must be between 3 and 25 characters long"),
  body("email", "Email is required")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email"),
  body("password", "Password is required")
    .optional()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("passwordConfirm", "Password confirmation is required")
    .optional()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords don't match"),
  body("icon")
    .optional()
    .trim()
    .isURL()
    .withMessage("Icon can only be a URL"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }

    // If its valid
    try {
      // look for previous email and username in user
      const previousUser = await User.findById(req.params.id, {
        username: 1,
        email: 1,
      }) as IUser;



      // look in db for a user with the same username
      const existingUser = await User.find({ username: req.body.username });

      // if one exists and its not the user itself, send error
      if (
        existingUser.length !== 0 &&
        req.body.username !== previousUser?.username
      ) {
        // return error and user data filled so far
        return res.status(400).send({
          errors: [{ msg: "Username already exists", user: req.body }],
        });
      }

      // look in db for a user with the same email
      const existingEmail = await User.find({ email: req.body.email });

      // if one exists and its not the user itself, send error
      if (
        existingEmail.length !== 0 &&
        req.body.email !== previousUser?.email
      ) {
        // return error and user data filled so far
        return res.status(400).send({
          errors: [{ msg: "Email already exists", user: req.body }],
        });
      }

      const userObj = {
        _id: req.params.id,
      } as IUser;

      // If an icon is provided, add it to obj
      if (req.body.icon !== undefined) {
        userObj.icon = req.body.icon;
      } 

      // If a username is provided  add it to obj
      if (req.body.username !== undefined) {
        userObj.username = req.body.username;
      } 

      // If a email is provided  add it to obj
      if (req.body.email !== undefined) {
        userObj.email = req.body.email;
      } 

      // If a password is provided  add it to obj
      if (req.body.password !== undefined) {
        // encrypt password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        userObj.password = hashedPassword; 
      } 

      // if no user exists with provided username, create one
      const newUser = new User(userObj);

      // option to return updated user
      const updateOption: QueryOptions & { rawResult: true } = {
        new: true,
        upsert: true,
        rawResult: true,
      };

      // update user in database
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        newUser,
        updateOption
      );

      return res.json({ user: updatedUser.value });
    } catch (err) {
      return next(err);
    }
  },
];

// Display details about an individual user
// DELETE user
exports.user_delete = (req: Request, res: Response, next: NextFunction) => {
  User.findByIdAndDelete(req.params.id, (err: Error) => {
    if (err) {
      return next(err);
    }
    res.json({ response: `deleted user ${req.params.id}` });
  });
};


// Voting mechanism
exports.user_vote = [
  body("vote")
    .custom((value, { req }) => {
      if (
        value === undefined ||
        (value !== "upVote" && value !== "downVote" && value !== "")
      ) {
        throw new Error("Invalid vote format");
      }
      // Indicates the success of this synchronous custom validator
      return true;
    })
    .withMessage("Invalid vote format"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }
    // If its valid
    try {
      const { userId, postId } = req.params;
      // if post doesn't exist, throw error
      const post = await Post.findById(postId, { text: 1 });
      if (post === null) {
        return res.status(400).send({
          errors: [{ msg: "Post doesn't exist" }],
        }); 
      }

      // option to return updated user
      const updateOption: QueryOptions & { rawResult: true } = {
        new: true,
        upsert: true,
        rawResult: true,
      };

      // location inside user document where vote will go
      const votePath = `votes.${postId}`;

      // update user in database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { [votePath]: req.body.vote } },
        updateOption,
      );

      return res.json({ user: updatedUser.value });
    } catch (err) {
      return next(err);
    }
  },
];