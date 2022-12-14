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
const postModel_1 = __importDefault(require("../models/postModel"));
const communityModel_1 = __importDefault(require("../models/communityModel"));
const express_validator_1 = require("express-validator");
// List all posts in database
exports.posts_list = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield postModel_1.default.find();
        return res.status(200).send({ posts });
    }
    catch (error) {
        return next(error);
    }
});
// Display details about an individual post
// GET post
exports.post_detail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield postModel_1.default.findById(req.params.id);
        if (post === null) {
            return res.status(404).send({ error: `No post with id ${req.params.id} found` });
        }
        return res.status(200).send({ post });
    }
    catch (error) {
        return next(error);
    }
});
// create an individual post
// POST post
exports.post_create = [
    (0, express_validator_1.body)("title", "Post title is required")
        .trim()
        .isLength({ min: 3, max: 300 })
        .escape()
        .withMessage("Post title must be between 3 and 300 characters long"),
    (0, express_validator_1.body)("text", "Post text is required")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Post text can't be empty"),
    (0, express_validator_1.body)("community", "A community is required")
        .trim()
        .escape()
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        // Look for community in database
        const existingCommunity = yield communityModel_1.default.findById(value);
        // If it doesn't exist, show error
        if (existingCommunity === null) {
            return Promise.reject();
        }
    }))
        .withMessage("Community doesn't exist"),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            return res.status(400).send({ errors: errors.array() });
        }
        try {
            // Create a new post
            const newPost = new postModel_1.default({
                title: req.body.title,
                text: req.body.text,
                community: req.body.community,
                user: req.body.userId,
                upVotes: 0,
                comments: [],
            });
            // Save it to database
            const savedPost = yield newPost.save();
            return res.send({ post: savedPost });
        }
        catch (err) {
            return next(err);
        }
    }),
];
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