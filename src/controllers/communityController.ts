const Community = require('../models/communityModel');
import { Request, Response } from 'express';

// List all communities in database
exports.communities_list = (req: Request, res: Response) => {
  res.send({ communities: "communities" });
};

// Display details about an individual community
// GET community
exports.community_detail = (req: Request, res: Response) => {
  res.send({ community: `Community ${req.params.id}` });
};

// create an individual community
// POST community
exports.community_create = (req: Request, res: Response) => {
  res.send({ community: `Community created` });
};

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
