"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const usersController = require('../controllers/userController');
const router = express_1.default.Router();
require("../passport");
// GET a single user
// only if user is authorized
router.get("/:id([a-zA-Z0-9]{24})", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
        if (err) {
            return next(err);
        }
        // Only show users if user is administrator
        if (user.permission === "admin") {
            next();
        }
        else {
            // if user is not admin, return error
            res.status(403).send({
                errors: [
                    {
                        msg: "Only administrators can get info about users",
                    },
                ],
            });
        }
    })(req, res, next);
}, usersController.user_detail);
// Log user in
router.post("/log-in", usersController.user_log_in);
// Sign user up
router.post("/sign-up", usersController.user_sign_up);
// PUT/update a single user
router.put("/:id([a-zA-Z0-9]{24})", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
        if (err) {
            return next(err);
        }
        // Only show users if user is administrator
        if (user.permission === "admin") {
            next();
        }
        else {
            // if user is not admin, return error
            res.status(403).send({
                errors: [
                    {
                        msg: "Only administrators can update users",
                    },
                ],
            });
        }
    })(req, res, next);
}, usersController.user_update);
// DELETE a single user
router.delete("/:id([a-zA-Z0-9]{24})", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
        if (err) {
            return next(err);
        }
        // Only show users if user is administrator
        if (user.permission === "admin") {
            next();
        }
        else {
            // if user is not admin, return error
            res.status(403).send({
                errors: [
                    {
                        msg: "Only administrators can delete users",
                    },
                ],
            });
        }
    })(req, res, next);
}, usersController.user_delete);
module.exports = router;
//# sourceMappingURL=users.js.map