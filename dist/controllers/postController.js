"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Post = require('../models/postModel');
// List all posts in database
exports.posts_list = (req, res) => {
    res.send({ posts: "posts" });
};
// Display details about an individual post
// GET post
exports.post_detail = (req, res) => {
    res.send({ post: `Post ${req.params.id}` });
};
// create an individual post
// POST post
exports.post_create = (req, res) => {
    res.send({ post: `Post created` });
};
// Update an individual post
// PUT post
exports.post_update = (req, res) => {
    res.send({ post: `Post ${req.params.id} updated` });
};
// Display details about an individual post
// DELETE post
exports.post_delete = (req, res) => {
    res.send({ post: `Post ${req.params.id} deleted` });
};
//# sourceMappingURL=postController.js.map