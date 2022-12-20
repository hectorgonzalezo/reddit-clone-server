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
const communityModel_1 = __importDefault(require("../models/communityModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const express_validator_1 = require("express-validator");
// List all communities in database
exports.communities_list = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const communities = yield communityModel_1.default.find();
        return res.status(200).send({ communities });
    }
    catch (error) {
        return next(error);
    }
});
// Display details about an individual community
// GET community
exports.community_detail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const community = yield communityModel_1.default.findById(req.params.id).populate("users");
        if (community === null) {
            return res
                .status(404)
                .send({ error: `No community with id ${req.params.id} found` });
        }
        return res.status(200).send({ community });
    }
    catch (error) {
        return next(error);
    }
});
// create an individual community
// POST community
exports.community_create = [
    (0, express_validator_1.body)("name", "Community name is required")
        .trim()
        .isLength({ min: 3, max: 21 })
        .escape()
        .withMessage("Community name must be between 3 and 21 characters long")
        .custom((value) => {
        return /^[a-zA-Z0-9_]+$/.test(value);
    })
        .withMessage("Only letters, numbers and underscore allowed in community name"),
    (0, express_validator_1.body)("subtitle", "Community subtitle is required")
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Community subtitle must be between 3 and 100 characters long"),
    (0, express_validator_1.body)("description", "Community description is required")
        .trim()
        .isLength({ min: 3, max: 300 })
        .withMessage("Community description must be between 3 and 300 characters long"),
    (0, express_validator_1.body)("icon").optional().trim().isURL().withMessage("Icon can only be a URL"),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            return res.status(400).send({ errors: errors.array() });
        }
        try {
            // Look for this same community
            const previousCommunity = yield communityModel_1.default.findById(req.params.id, {
                name: 1,
            });
            // Look for community in database
            const existingCommunity = yield communityModel_1.default.find({ name: req.body.name }, { name: 1 });
            // if a community exist with that name, and it's not the community to be updated, send error
            if (existingCommunity.length !== 0 &&
                req.body.name !== (previousCommunity === null || previousCommunity === void 0 ? void 0 : previousCommunity.name)) {
                // return error and user data filled so far
                return res.status(400).send({
                    errors: [{ msg: "Community name already exists", user: req.body }],
                });
            }
            // If no community with that name exists, create one
            const communityObj = {
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
            const newCommunity = new communityModel_1.default(communityObj);
            // Save it to database
            const savedCommunity = yield newCommunity.save();
            return res.send({ community: savedCommunity });
        }
        catch (err) {
            return next(err);
        }
    }),
];
// Update an individual community
// PUT community
exports.community_update = [
    (0, express_validator_1.body)("name", "Community name is required")
        .trim()
        .isLength({ min: 3, max: 21 })
        .escape()
        .withMessage("Community name must be between 3 and 21 characters long")
        .custom((value) => {
        return /^[a-zA-Z0-9_]+$/.test(value);
    })
        .withMessage("Only letters, numbers and underscore allowed in community name"),
    (0, express_validator_1.body)("subtitle", "Community subtitle is required")
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Community subtitle must be between 3 and 100 characters long"),
    (0, express_validator_1.body)("description", "Community description is required")
        .trim()
        .isLength({ min: 3, max: 300 })
        .withMessage("Community description must be between 3 and 300 characters long"),
    (0, express_validator_1.body)("icon").optional().trim().isURL().withMessage("Icon can only be a URL"),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            return res.status(400).send({ errors: errors.array() });
        }
        try {
            // Look for this same community
            const previousCommunity = yield communityModel_1.default.findById(req.params.id, {
                name: 1,
                users: 1,
                posts: 1,
            });
            // Look for community in database
            const existingCommunity = yield communityModel_1.default.find({ name: req.body.name }, { name: 1 });
            // if a community exist with that name, and it's not the community to be updated, send error
            if (existingCommunity.length !== 0 &&
                req.body.name !== (previousCommunity === null || previousCommunity === void 0 ? void 0 : previousCommunity.name)) {
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
            const communityObj = {
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
            const newCommunity = new communityModel_1.default(communityObj);
            // option to return updated community
            const updateOptions = {
                new: true,
                upsert: true,
                rawResult: true,
            };
            // Save it to database
            const updatedCommunity = yield communityModel_1.default.findByIdAndUpdate(req.params.id, newCommunity, updateOptions);
            res.send({ community: updatedCommunity.value });
            return;
        }
        catch (err) {
            return next(err);
        }
    }),
];
// Display details about an individual community
// DELETE community
exports.community_delete = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const community = yield communityModel_1.default.findByIdAndDelete(req.params.id);
        // if coummunity doesn't exist, send error
        if (community === null) {
            return res
                .status(404)
                .send({ error: `No community with id ${req.params.id} found` });
        }
        return res.send({ msg: `Community ${req.params.id} deleted` });
    }
    catch (err) {
        return next(err);
    }
});
// Subscribe to community
exports.community_subscribe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { communityId, userId } = req.params;
        const prevCommunity = yield communityModel_1.default.findById(communityId, { _id: 1 });
        // if community doesn't exist, send error
        if (prevCommunity === null) {
            return res
                .status(404)
                .send({ error: `No community with id ${communityId} found` });
        }
        // option to return updated community
        const updateOptions = {
            new: true,
            upsert: true,
            rawResult: true,
        };
        // Add user to community
        const community = yield communityModel_1.default.findByIdAndUpdate(communityId, { $addToSet: { users: userId } }, updateOptions);
        // add community to user
        const user = yield userModel_1.default.findByIdAndUpdate(userId, { $addToSet: { communities: communityId } }, updateOptions);
        // if user doesn't exist, send error
        if (user === null) {
            return res.status(404).send({ error: `No user with id ${userId} found` });
        }
        return res.send({
            message: `User ${userId} subscribed to community ${communityId}`,
            community: community.value,
            user: user.value,
        });
    }
    catch (err) {
        return next(err);
    }
});
// Unsubscribe from community
exports.community_unSubscribe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { communityId, userId } = req.params;
        // option to return updated community
        const updateOptions = {
            new: true,
            upsert: true,
            rawResult: true,
        };
        const prevCommunity = yield communityModel_1.default.findById(communityId, { _id: 1 });
        // if community doesn't exist, send error
        if (prevCommunity === null) {
            return res
                .status(404)
                .send({ error: `No community with id ${communityId} found` });
        }
        // Add user to community
        const community = yield communityModel_1.default.findByIdAndUpdate(communityId, { $pull: { users: userId } }, updateOptions);
        // if community doesn't exist, send error
        if (community === null) {
            return res
                .status(404)
                .send({ error: `No community with id ${communityId} found` });
        }
        // add community to user
        const user = yield userModel_1.default.findByIdAndUpdate(userId, { $pull: { communities: communityId } }, updateOptions);
        // if community doesn't exist, send error
        if (user === null) {
            return res.status(404).send({ error: `No user with id ${userId} found` });
        }
        return res.send({
            message: `User ${userId} unsubscribed from community ${communityId}`,
            community: community.value,
            user: user.value,
        });
    }
    catch (err) {
        return next(err);
    }
});
//# sourceMappingURL=communityController.js.map