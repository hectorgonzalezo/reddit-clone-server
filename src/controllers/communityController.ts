import Community from '../models/communityModel';
import { body, validationResult } from 'express-validator';
import { QueryOptions } from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import { ICommunity } from 'src/types/models';

// List all communities in database
exports.communities_list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const communities = await Community.find();
    return res.status(200).send({ communities });
  } catch (error) {
    return next(error);
  }
};

// Display details about an individual community
// GET community
exports.community_detail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const community = await Community.findById(req.params.id);
    if (community === null) {
      return res
        .status(404)
        .send({ error: `No community with id ${req.params.id} found` });
    }
    return res.status(200).send({ community });
  } catch (error) {
    return next(error);
  }
};

// create an individual community
// POST community
exports.community_create = [
  body("name", "Community name is required")
    .trim()
    .isLength({ min: 3, max: 21 })
    .escape()
    .withMessage("Community name must be between 3 and 21 characters long")
    .custom((value) => {
      return /^[a-zA-Z0-9_]+$/.test(value);
    })
    .withMessage(
      "Only letters, numbers and underscore allowed in community name"
    ).custom(async (value) => {
      // Look for community in database
      const existingCommunity = await Community.find({ name: value });
      // If it exists, show error
      if (existingCommunity.length !== 0) {
        return Promise.reject();
      }
    })
    .withMessage("Community name already exists"),
  body("subtitle", "Community subtitle is required")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape()
    .withMessage("Community subtitle must be between 3 and 100 characters long"),
  body("description", "Community description is required")
    .trim()
    .isLength({ min: 3, max: 300 })
    .escape()
    .withMessage("Community description must be between 3 and 300 characters long"),
  body("icon")
    .optional()
    .trim()
    .isURL()
    .withMessage("Icon has to be a URl"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }
    try {

      // If no community with that name exists, create one
      const communityObj: ICommunity = {
        name: req.body.name,
        subtitle: req.body.subtitle,
        description: req.body.description,
        creator: req.body.userId,
        users: [],
        posts: [],
      };
      // Add icon if one was provided
      if (req.body.icon !== undefined) {
        communityObj.icon = req.body.icon;
      }

      const newCommunity = new Community(communityObj);

      // Save it to database  
      const savedCommunity = await newCommunity.save();

      return res.send({ community: savedCommunity });
    } catch (err) {
      return next(err);
    }
  },
];

// Update an individual community
// PUT community
exports.community_update = [
  body("name", "Community name is required")
    .trim()
    .isLength({ min: 3, max: 21 })
    .escape()
    .withMessage("Community name must be between 3 and 21 characters long")
    .custom((value) => {
      return /^[a-zA-Z0-9_]+$/.test(value);
    })
    .withMessage(
      "Only letters, numbers and underscore allowed in community name"
    ).custom(async (value) => {
      // Look for community in database
      const existingCommunity = await Community.find({ name: value });
      // If it exists, show error
      if (existingCommunity.length !== 0) {
        return Promise.reject();
      }
    })
    .withMessage("Community name already exists"),
  body("subtitle", "Community subtitle is required")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape()
    .withMessage("Community subtitle must be between 3 and 100 characters long"),
  body("description", "Community description is required")
    .trim()
    .isLength({ min: 3, max: 300 })
    .escape()
    .withMessage("Community description must be between 3 and 300 characters long"),
  body("icon")
    .optional()
    .trim()
    .isURL()
    .withMessage("Icon has to be a URl"),
   
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }
    try {

      let previousCommunity: ICommunity;
      // Get posts and users from previous entry
      previousCommunity = (await Community.findById(req.params.id, {
        users: 1,
        posts: 1,
      })) as ICommunity;

      if (previousCommunity === null) {
        // If no community is found, send error;
        return res
          .status(404)
          .send({ error: `No community with id ${req.params.id} found` });
      }
      
      // If no community with that name exists, create one
      const communityObj: ICommunity = {
        name: req.body.name,
        subtitle: req.body.subtitle,
        description: req.body.description,
        creator: req.body.userId,
        users: previousCommunity.users,
        posts: previousCommunity.posts,
        _id: req.params.id,
      };

      // Add icon if one was provided
      if (req.body.icon !== undefined) {
        communityObj.icon = req.body.icon;
      }

      const newCommunity = new Community(communityObj);
      // option to return updated community 
      const updateOptions: QueryOptions & { rawResult: true } = {
        new: true,
        upsert: true,
        rawResult: true,
      };

      // Save it to database
      const updatedCommunity = await Community.findByIdAndUpdate(
        req.params.id,
        newCommunity,
        updateOptions
      );
      res.send({ community: updatedCommunity.value });
      return;
    } catch (err) {
      return next(err);
    }
  },
];

// Display details about an individual community
// DELETE community
exports.community_delete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const community = await Community.findByIdAndDelete(req.params.id);
    // if coummunity doesn't exist, send error
    if (community === null) {
      return res
        .status(404)
        .send({ error: `No community with id ${req.params.id} found` });
    }
    return res.send({ msg: `Community ${req.params.id} deleted` });
  } catch (err) {
    return next(err);
  }
};
