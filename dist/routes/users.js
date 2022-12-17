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
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const usersController = require("../controllers/userController");
const router = express_1.default.Router();
require("../passport");
// GET a single user
// only if user is authorized
router.get("/:id([a-zA-Z0-9]{24})", usersController.user_detail);
// voting
router.put("/:userId([a-zA-Z0-9]{24})/vote/:postId([a-zA-Z0-9]{24})", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (err || !user || ((_a = user._id) === null || _a === void 0 ? void 0 : _a.toString()) !== req.params.userId) {
            // return error, if user is not authorized 
            // or is trying to vote for someone else
            return res.status(403).send({
                errors: [
                    {
                        msg: "Only the user itself can vote",
                    },
                ],
            });
        }
        // if the users isn't the creator of community, send error
        req.body.userId = (_b = user._id) === null || _b === void 0 ? void 0 : _b.toString();
        return next();
    }))(req, res, next);
}, usersController.user_vote);
// Log user in
router.post("/log-in", usersController.user_log_in);
// Sign user up
router.post("/sign-up", usersController.user_sign_up);
// PUT/update a single user
router.put("/:id([a-zA-Z0-9]{24})", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (err ||
            !user ||
            (((_a = user._id) === null || _a === void 0 ? void 0 : _a.toString()) !== req.params.id &&
                user.permission !== "admin")) {
            // return error, if user is not authorized
            // or is trying to vote for someone else
            return res.status(403).send({
                errors: [
                    {
                        msg: "Only the user itself can update it",
                    },
                ],
            });
        }
        // if the users isn't the creator of community, send error
        req.body.userId = (_b = user._id) === null || _b === void 0 ? void 0 : _b.toString();
        return next();
    }))(req, res, next);
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