"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commentModel_1 = __importDefault(require("../models/commentModel"));
const postModel_1 = __importDefault(require("../models/postModel"));
const express_validator_1 = require("express-validator");
// List all comments in database
exports.comments_list = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Look for post and extract comments
        const { comments } = (yield postModel_1.default.findById(req.postId, {
            comments: 1,
        }).populate({
            path: "comments",
            populate: { path: "responses", model: "Comment" },
        }));
        // console.log(comments)
        return res.status(200).send({ comments });
    }
    catch (error) {
        return next(error);
    }
});
// Display details about an individual comment
// GET comment
exports.comment_detail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield commentModel_1.default.findById(req.params.id);
        if (comment === null) {
            return res
                .status(404)
                .send({ error: `No comment with id ${req.params.id} found` });
        }
        return res.status(200).send({ comment });
    }
    catch (error) {
        return next(error);
    }
});
// create an individual comment
// comment comment
exports.comment_create = [
    (0, express_validator_1.body)("text", "Comment text is required")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Comment text can't be empty"),
    (0, express_validator_1.body)("parent")
        .optional()
        .trim()
        .escape()
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        // Look for community in database
        const existingCommunity = yield commentModel_1.default.findById(value);
        // If it doesn't exist, show error
        if (existingCommunity === null) {
            return Promise.reject();
        }
    }))
        .withMessage("Parent comment doesn't exist"),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            return res.status(400).send({ errors: errors.array() });
        }
        try {
            // Create a new comment
            const newComment = new commentModel_1.default({
                text: req.body.text,
                user: req.body.userId,
                upVotes: 0,
                responses: [],
            });
            // Save it to database
            const savedComment = yield newComment.save();
            // If there's a parent, add comment to it, otherwise add to post
            if (req.body.parent === undefined) {
                // add comment to post
                yield postModel_1.default.findByIdAndUpdate(req.postId, {
                    $push: { comments: savedComment._id },
                });
            }
            else {
                // add comment to previous comment
                yield commentModel_1.default.findByIdAndUpdate(req.body.parent, {
                    $push: { responses: savedComment._id },
                });
            }
            return res.send({ comment: savedComment });
        }
        catch (err) {
            return next(err);
        }
    }),
];
// Update an individual comment
// PUT comment
exports.comment_update = [
    (0, express_validator_1.body)("text", "Comment text is required")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Comment text can't be empty"),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            return res.status(400).send({ errors: errors.array() });
        }
        try {
            let previousComment;
            // Get upVotes and responses from previous entry
            previousComment = (yield commentModel_1.default.findById(req.params.id, {
                upVotes: 1,
                responses: 1,
            }));
            if (previousComment === null) {
                // If no community is found, send error;
                return res
                    .status(404)
                    .send({ error: `No comment with id ${req.params.id} found` });
            }
            // Create a new comment
            const newComment = new commentModel_1.default({
                text: req.body.text,
                user: req.body.userId,
                upVotes: previousComment.upVotes,
                responses: previousComment.responses,
                _id: req.params.id,
            });
            // option to return updated comment
            const updateOptions = {
                new: true,
                upsert: true,
                rawResult: true,
            };
            // Update comment in database
            const updatedComment = yield commentModel_1.default.findByIdAndUpdate(req.params.id, newComment, updateOptions);
            return res.send({ comment: updatedComment.value });
        }
        catch (err) {
            return next(err);
        }
    }),
];
// Display details about an individual comment
// DELETE comment
exports.comment_delete = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield commentModel_1.default.findByIdAndDelete(req.params.id);
        // if comment doesn't exist, send error
        if (comment === null) {
            return res
                .status(404)
                .send({ error: `No comment with id ${req.params.id} found` });
        }
        return res.send({ msg: `Comment ${req.params.id} deleted` });
    }
    catch (err) {
        return next(err);
    }
});
//# sourceMappingURL=commentController.js.map