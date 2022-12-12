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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const userModel_1 = __importDefault(require("../models/userModel"));
const TOKEN_EXPIRATION = "24h";
// Display details about an individual user
// GET user
exports.user_detail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.send({ user: `User ${req.params.id}` });
    try {
        const user = yield userModel_1.default.findById(req.params.id, { username: 1 });
        // return queried user as json
        res.json({ user });
    }
    catch (err) {
        next(err);
    }
});
// Log in user
exports.user_log_in = [
    (0, express_validator_1.body)("username")
        .trim()
        .isLength({ min: 3, max: 25 })
        .escape()
        .withMessage("User name must be between 3 and 25 characters long"),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        // if validation didn't succeed
        if (!errors.isEmpty()) {
            // Return errors
            res.status(400).send({ errors: errors.array() });
            return;
        }
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
            // look in db for a user with the same username
            const existingUser = yield userModel_1.default.find({ username: req.body.username });
            // if one exists, send error
            if (existingUser.length !== 0) {
                // return error and user data filled so far
                return res.status(400).send({
                    errors: [{ msg: "Username already exists", user: req.body }],
                });
            }
            // look in db for a user with the same email
            const existingEmail = yield userModel_1.default.find({ email: req.body.email });
            // if one exists, send error
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
            });
            // and save it to database
            yield newUser.save();
            // generate a signed son web token with the contents of user object and return it in the response
            // user must be converted to JSON
            const token = jsonwebtoken_1.default.sign(newUser.toJSON(), process.env.AUTH_SECRET, { expiresIn: TOKEN_EXPIRATION });
            return res.json({ user: newUser, token });
        }
        catch (err) {
            return next(err);
        }
    }),
];
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