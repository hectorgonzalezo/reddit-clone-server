import Community from "../models/communityModel";
import User from "../models/userModel";
import { body, validationResult } from "express-validator";
import { QueryOptions } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { ICommunity } from "src/types/models";

// List all communities in database
exports.communities_list = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
) => {
  try {
    const community = await Community.findById(req.params.id).populate("users");
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
    ),
  body("subtitle", "Community subtitle is required")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage(
      "Community subtitle must be between 3 and 100 characters long"
    ),
  body("description", "Community description is required")
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage(
      "Community description must be between 3 and 300 characters long"
    ),
  body("icon").optional().trim().isURL().withMessage("Icon can only be a URL"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      // Look for this same community
      const [previousCommunity, existingCommunity] = await Promise.all([
        Community.findById(req.params.id, { name: 1 }),
        Community.find({ name: req.body.name }, { name: 1 }),
      ]);
      // Look for community in database
      // if a community exist with that name, and it's not the community to be updated, send error
      if (
        existingCommunity.length !== 0 &&
        req.body.name !== previousCommunity?.name
      ) {
        // return error and user data filled so far
        return res.status(400).send({
          errors: [{ msg: "Community name already exists", user: req.body }],
        });
      }

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
    ),
  body("subtitle", "Community subtitle is required")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage(
      "Community subtitle must be between 3 and 100 characters long"
    ),
  body("description", "Community description is required")
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage(
      "Community description must be between 3 and 300 characters long"
    ),
  body("icon").optional().trim().isURL().withMessage("Icon can only be a URL"),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    // if validation didn't succeed
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      // Look for this same community
      const [previousCommunity, existingCommunity] = await Promise.all([
        Community.findById(req.params.id, { name: 1, users: 1, posts: 1 }),
        // Look for community namein database
        Community.find({ name: req.body.name }, { name: 1 }),
      ]);
      // if a community exist with that name, and it's not the community to be updated, send error
      if (
        existingCommunity.length !== 0 &&
        req.body.name !== previousCommunity?.name
      ) {
        // return error and user data filled so far
        return res.status(400).send({
          errors: [{ msg: "Community name already exists", user: req.body }],
        });
      }

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
        updateOptions,
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
  next: NextFunction,
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


// Subscribe to community
exports.community_subscribe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    
    const { communityId, userId } = req.params;

    const prevCommunity = await Community.findById(communityId, { _id: 1 });
    // if community doesn't exist, send error
    if (prevCommunity === null) {
      return res
        .status(404)
        .send({ error: `No community with id ${communityId} found` });

    }

    // option to return updated community
    const updateOptions: QueryOptions & { rawResult: true } = {
      new: true,
      upsert: true,
      rawResult: true,
    };
    const [community, user] = await Promise.all([
      // Add user to community
      Community.findByIdAndUpdate(
        communityId,
        { $addToSet: { users: userId } },
        updateOptions,
      ),
      // add community to user
      User.findByIdAndUpdate(
        userId,
        { $addToSet: { communities: communityId } },
        updateOptions,
      ),
    ]);

    // if user doesn't exist, send error
    if (user === null) {
      return res.status(404).send({ error: `No user with id ${userId} found` });
    }

    return res.send({
      message: `User ${userId} subscribed to community ${communityId}`,
      community: community.value,
      user: user.value,
    });
  } catch (err) {
    return next(err);
  }
};

// Unsubscribe from community
exports.community_unSubscribe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { communityId, userId } = req.params;
    // option to return updated community
    const updateOptions: QueryOptions & { rawResult: true } = {
      new: true,
      upsert: true,
      rawResult: true,
    };

    const prevCommunity = await Community.findById(communityId, { _id: 1 });
    // if community doesn't exist, send error
    if (prevCommunity === null) {
      return res
        .status(404)
        .send({ error: `No community with id ${communityId} found` });
    }

    const [community, user] = await Promise.all([
      // Add user to community
      Community.findByIdAndUpdate(
        communityId,
        { $pull: { users: userId } },
        updateOptions,
      ),
      // add community to user
      User.findByIdAndUpdate(
        userId,
        { $pull: { communities: communityId } },
        updateOptions,
      ),
    ]);
 
    // if community doesn't exist, send error
    if (community === null) {
      return res
        .status(404)
        .send({ error: `No community with id ${communityId} found` });

    }

    // if community doesn't exist, send error
    if (user === null) {
      return res.status(404).send({ error: `No user with id ${userId} found` });
    }
    return res.send({
      message: `User ${userId} unsubscribed from community ${communityId}`,
      community: community.value,
      user: user.value,
    });
  } catch (err) {
    return next(err);
  }
};