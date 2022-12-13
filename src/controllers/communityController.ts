import Community from '../models/communityModel';
import { body, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import { ICommunity } from 'src/types/models';
import { userInfo } from 'os';

// List all communities in database
exports.communities_list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const communities = await Community.find(); 
    return res.status(200).send({ communities });
  } catch (error) {
    return next(error);
  }
};

// Display details about an individual community
// GET community
exports.community_detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const community = await Community.findById(req.params.id); 
    return res.status(200).send({ community });
  } catch (error) {
    return res.status(400).send({ error: `No community with id ${req.params.id} found` });
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
      // look in db for a community with the same name
      const existingCommunity = await Community.find({ name: req.body.name });

      // if one exists, send error
      if (existingCommunity.length !== 0) {
        // return error and data filled so far
        return res.status(400).send({
          errors: [{ msg: "Community name already exists", community: req.body }],
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
exports.community_update = (req: Request, res: Response) => {
  res.send({ community: `Community ${req.params.id} updated` });
};

// Display details about an individual community
// DELETE community
exports.community_delete = (req: Request, res: Response) => {
  res.send({ community: `Community ${req.params.id} deleted` });
};
