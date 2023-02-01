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
const passport_1 = __importDefault(require("passport"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const userModel_1 = __importDefault(require("../models/userModel"));
const postModel_1 = __importDefault(require("../models/postModel"));
// Display details about an individual user
// GET user
exports.user_detail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.params.id, {
            username: 1,
            icon: 1,
            createdAt: 1,
            communities: 1,
            votes: 1,
        }).populate("communities");
        // return queried user as json
        if (user !== null) {
            return res.json({ user });
        }
        return res.status(404).send('User not found');
    }
    catch (err) {
        return next(err);
    }
});
// Log in user
exports.user_log_in = [
    (0, express_validator_1.body)("username")
        .trim()
        .isLength({ min: 3, max: 25 })
        .escape()
        .withMessage("Username must be between 3 and 25 characters long"),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            return res.status(400).send({ errors: errors.array() });
        }
        passport_1.default.authenticate("local", { session: false }, (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    errors: [{ msg: "Incorrect username or password" }],
                    user,
                });
            }
            req.login(user, { session: false }, (loginErr) => {
                if (loginErr) {
                    return next(loginErr);
                }
                // generate a signed son web token with the contents of user object and return it in the response
                // user must be converted to JSON
                const token = jsonwebtoken_1.default.sign(user.toJSON(), process.env.AUTH_SECRET);
                return res.json({ user, token });
            });
        })(req, res);
    },
];
// Sign up user
exports.user_sign_up = [
    (0, express_validator_1.body)("username", "Username is required")
        .trim()
        .isLength({ min: 3, max: 25 })
        .escape()
        .withMessage("Username must be between 3 and 25 characters long"),
    (0, express_validator_1.body)("email", "Email is required")
        .trim()
        .isEmail()
        .withMessage("Invalid email"),
    (0, express_validator_1.body)("password", "Password is required")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("passwordConfirm", "Password confirmation is required")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords don't match"),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            return res.status(400).send({ errors: errors.array() });
        }
        // If its valid
        try {
            // encrypt password
            const hashedPassword = yield bcryptjs_1.default.hash(req.body.password, 10);
            // look in db for a user with the same username or email
            const [existingUser, existingEmail] = yield Promise.all([
                userModel_1.default.find({ username: req.body.username }),
                userModel_1.default.find({ email: req.body.email }),
            ]);
            // if username exists, send error
            if (existingUser.length !== 0) {
                // return error and user data filled so far
                return res.status(400).send({
                    errors: [{ msg: "Username already exists", user: req.body }],
                });
            }
            // if email exists, send error
            if (existingEmail.length !== 0) {
                // return error and user data filled so far
                return res.status(400).send({
                    errors: [{ msg: "Email already exists", user: req.body }],
                });
            }
            // if no user exists with provided username, create one
            const newUser = new userModel_1.default({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                permission: "regular",
                communities: [],
                votes: {},
            });
            // and save it to database
            const user = yield newUser.save();
            // generate a signed son web token with the contents of user object and return it in the response
            // user must be converted to JSON
            const token = jsonwebtoken_1.default.sign(newUser.toJSON(), process.env.AUTH_SECRET);
            return res.json({ user, token });
        }
        catch (err) {
            return next(err);
        }
    }),
];
// Update an individual user
// PUT user
exports.user_update = [
    (0, express_validator_1.body)("username", "Username is required")
        .optional()
        .trim()
        .isLength({ min: 3, max: 25 })
        .escape()
        .withMessage("Username must be between 3 and 25 characters long"),
    (0, express_validator_1.body)("email", "Email is required")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Invalid email"),
    (0, express_validator_1.body)("password", "Password is required")
        .optional()
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("passwordConfirm", "Password confirmation is required")
        .optional()
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords don't match"),
    (0, express_validator_1.body)("icon")
        .optional()
        .trim()
        .isURL()
        .withMessage("Icon can only be a URL"),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            return res.status(400).send({ errors: errors.array() });
        }
        // If its valid
        try {
            const [previousUser, existingUser, existingEmail] = yield Promise.all([
                // look for previous email and username in user
                userModel_1.default.findById(req.params.id, { username: 1, email: 1 }),
                // look in db for a user with the same username
                userModel_1.default.find({ username: req.body.username }),
                // look in db for a user with the same email
                userModel_1.default.find({ email: req.body.email }),
            ]);
            // if username exists and its not the user itself, send error
            if (existingUser.length !== 0 &&
                req.body.username !== (previousUser === null || previousUser === void 0 ? void 0 : previousUser.username)) {
                // return error and user data filled so far
                return res.status(400).send({
                    errors: [{ msg: "Username already exists", user: req.body }],
                });
            }
            // if email exists and its not the user itself, send error
            if (existingEmail.length !== 0 &&
                req.body.email !== (previousUser === null || previousUser === void 0 ? void 0 : previousUser.email)) {
                // return error and user data filled so far
                return res.status(400).send({
                    errors: [{ msg: "Email already exists", user: req.body }],
                });
            }
            const userObj = {
                _id: req.params.id,
            };
            // If an icon is provided, add it to obj
            if (req.body.icon !== undefined) {
                userObj.icon = req.body.icon;
            }
            // If a username is provided  add it to obj
            if (req.body.username !== undefined) {
                userObj.username = req.body.username;
            }
            // If a email is provided  add it to obj
            if (req.body.email !== undefined) {
                userObj.email = req.body.email;
            }
            // If a password is provided  add it to obj
            if (req.body.password !== undefined) {
                // encrypt password
                const hashedPassword = yield bcryptjs_1.default.hash(req.body.password, 10);
                userObj.password = hashedPassword;
            }
            // if no user exists with provided username, create one
            const newUser = new userModel_1.default(userObj);
            // option to return updated user
            const updateOption = {
                new: true,
                upsert: true,
                rawResult: true,
            };
            // update user in database
            const updatedUser = yield userModel_1.default.findByIdAndUpdate(req.params.id, newUser, updateOption);
            return res.json({ user: updatedUser.value });
        }
        catch (err) {
            return next(err);
        }
    }),
];
// Display details about an individual user
// DELETE user
exports.user_delete = (req, res, next) => {
    userModel_1.default.findByIdAndDelete(req.params.id, (err) => {
        if (err) {
            return next(err);
        }
        res.json({ response: `deleted user ${req.params.id}` });
    });
};
// Voting mechanism
exports.user_vote = [
    (0, express_validator_1.body)("vote")
        .custom((value) => {
        if (value === undefined ||
            (value !== "upVote" && value !== "downVote" && value !== "")) {
            throw new Error("Invalid vote format");
        }
        // Indicates the success of this synchronous custom validator
        return true;
    })
        .withMessage("Invalid vote format"),
    (0, express_validator_1.body)("increase")
        .isNumeric()
        .withMessage("Increase must be a number")
        .custom((value) => {
        if (value < -2 || value > 2) {
            throw new Error("Invalid increase");
        }
        // Indicates the success of this synchronous custom validator
        return true;
    })
        .withMessage("Invalid increase"),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            return res.status(400).send({ errors: errors.array() });
        }
        // If its valid
        try {
            // option to return updated user
            const updateOption = {
                new: true,
                upsert: true,
                rawResult: true,
            };
            const { userId, postId } = req.params;
            // increase upVotes by requested amount
            const updatedPost = yield postModel_1.default.findByIdAndUpdate(postId, { $inc: { upVotes: req.body.increase } }, updateOption);
            // if post doesn't exist, throw error
            if (((_a = updatedPost.lastErrorObject) === null || _a === void 0 ? void 0 : _a.updatedExisting) === false) {
                return res.status(400).send({
                    errors: [{ msg: "Post doesn't exist" }],
                });
            }
            // couldn't populate user and community, needed to display them on post
            const post = yield postModel_1.default.findById(postId)
                .populate({ path: "community", select: "name posts users icon" })
                .populate("user", "username");
            // location inside user document where vote will go
            const votePath = `votes.${postId}`;
            // update user in database
            const updatedUser = yield userModel_1.default.findByIdAndUpdate(userId, { $set: { [votePath]: req.body.vote } }, updateOption);
            return res.json({ user: updatedUser.value, post });
        }
        catch (err) {
            return next(err);
        }
    }),
];
//# sourceMappingURL=userController.js.map