"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require('../models/userModel');
// List all users in database
exports.users_list = (req, res) => {
    res.send({ users: "users" });
};
// Display details about an individual user
// GET user
exports.user_detail = (req, res) => {
    res.send({ user: `User ${req.params.id}` });
};
// create an individual user
// POST user
exports.user_create = (req, res) => {
    res.send({ user: `User created` });
};
// Update an individual user
// PUT user
exports.user_update = (req, res) => {
    res.send({ user: `User ${req.params.id} updated` });
};
// Display details about an individual user
// DELETE user
exports.user_delete = (req, res) => {
    res.send({ user: `User ${req.params.id} deleted` });
};
//# sourceMappingURL=userController.js.map