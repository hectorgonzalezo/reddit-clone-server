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
        const community = yield communityModel_1.default.findById(req.params.id);
        return res.status(200).send({ community });
    }
    catch (error) {
        return res.status(400).send({ error: `No community with id ${req.params.id} found` });
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
        .escape()
        .withMessage("Community subtitle must be between 3 and 100 characters long"),
    (0, express_validator_1.body)("description", "Community description is required")
        .trim()
        .isLength({ min: 3, max: 300 })
        .escape()
        .withMessage("Community description must be between 3 and 300 characters long"),
    (0, express_validator_1.body)("icon")
        .optional()
        .trim()
        .isURL()
        .withMessage("Icon has to be a URl"),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            return res.status(400).send({ errors: errors.array() });
        }
        try {
            // look in db for a community with the same name
            const existingCommunity = yield communityModel_1.default.find({ name: req.body.name });
            // if one exists, send error
            if (existingCommunity.length !== 0) {
                // return error and data filled so far
                return res.status(400).send({
                    errors: [{ msg: "Community name already exists", community: req.body }],
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
        .escape()
        .withMessage("Community subtitle must be between 3 and 100 characters long"),
    (0, express_validator_1.body)("description", "Community description is required")
        .trim()
        .isLength({ min: 3, max: 300 })
        .escape()
        .withMessage("Community description must be between 3 and 300 characters long"),
    (0, express_validator_1.body)("icon")
        .optional()
        .trim()
        .isURL()
        .withMessage("Icon has to be a URl"),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            return res.status(400).send({ errors: errors.array() });
        }
        try {
            // look in db for a community with the same name
            const existingCommunity = yield communityModel_1.default.find({ name: req.body.name });
            // if one exists, send error
            if (existingCommunity.length !== 0 &&
                existingCommunity[0]._id.toString() !== req.params.id) {
                // return error and data filled so far
                return res.status(400).send({
                    errors: [
                        { msg: "Community name already exists", community: req.body },
                    ],
                });
            }
            // Get posts and users from previous entry
            const previousCommunity = yield communityModel_1.default.findById(req.params.id);
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
exports.community_delete = (req, res) => {
    res.send({ community: `Community ${req.params.id} deleted` });
};
//# sourceMappingURL=communityController.js.map