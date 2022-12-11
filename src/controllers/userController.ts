const User = require('../models/userModel');
import { Request, Response } from 'express';

// List all users in database
exports.users_list = (req: Request, res: Response) => {
  res.send({ users: "users" });
};

// Display details about an individual user
// GET user
exports.user_detail = (req: Request, res: Response) => {
  res.send({ user: `User ${req.params.id}` });
};

// create an individual user
// POST user
exports.user_create = (req: Request, res: Response) => {
  res.send({ user: `User created` });
};

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
