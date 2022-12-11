"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Comment = require('../models/commentModel');
// List all comments in database
exports.comments_list = (req, res) => {
    res.send({ comments: "comments" });
};
// Display details about an individual comment
// GET comment
exports.comment_detail = (req, res) => {
    res.send({ comment: `Comment ${req.params.id}` });
};
// create an individual comment
// comment comment
exports.comment_create = (req, res) => {
    res.send({ comment: `Comment created` });
};
// Update an individual comment
// PUT comment
exports.comment_update = (req, res) => {
    res.send({ comment: `Comment ${req.params.id} updated` });
};
// Display details about an individual comment
// DELETE comment
exports.comment_delete = (req, res) => {
    res.send({ comment: `Comment ${req.params.id} deleted` });
};
//# sourceMappingURL=commentController.js.map