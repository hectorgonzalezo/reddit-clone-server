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
const commentModel_1 = __importDefault(require("../models/commentModel"));
const commentsController = require("../controllers/commentController");
const router = express_1.default.Router();
// GET all comments
router.get("/", commentsController.comments_list);
// GET a single comment
router.get("/:id([a-zA-Z0-9]{24})", commentsController.comment_detail);
// POST/create a single comment
router.post("/", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
        var _a;
        if (err || !user) {
            // if user is not authorized
            return res.status(403).send({
                errors: [
                    {
                        msg: "Only logged in users can add comments",
                    },
                ],
            });
        }
        req.body.userId = (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString();
        return next();
    })(req, res, next);
}, commentsController.comment_create);
// PUT/update a single comment
router.put("/:id([a-zA-Z0-9]{24})", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const comment = yield commentModel_1.default.findById(req.params.id, { user: 1 });
        if (comment === null) {
            // If no community is found, send error;
            return res
                .status(404)
                .send({ error: `No comment with id ${req.params.id} found` });
        }
        const commentUser = comment === null || comment === void 0 ? void 0 : comment.user;
        const isUserCreator = ((_a = commentUser._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = user._id) === null || _b === void 0 ? void 0 : _b.toString());
        const isUserAdmin = user.permission === "admin";
        if (err || !user || (!isUserCreator && !isUserAdmin)) {
            // if user is not admin, return error
            return res.status(403).send({
                errors: [
                    {
                        msg: "Only the comment creator can update it",
                    },
                ],
            });
        }
        req.body.userId = (_c = user._id) === null || _c === void 0 ? void 0 : _c.toString();
        return next();
    }))(req, res, next);
}, commentsController.comment_update);
// DELETE a single comment
router.delete("/:id([a-zA-Z0-9]{24})", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const comment = yield commentModel_1.default.findById(req.params.id, { user: 1 });
        if (comment === null) {
            // If no community is found, send error;
            return res
                .status(404)
                .send({ error: `No comment with id ${req.params.id} found` });
        }
        const commentUser = comment === null || comment === void 0 ? void 0 : comment.user;
        const isUserCreator = ((_a = commentUser._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = user._id) === null || _b === void 0 ? void 0 : _b.toString());
        const isUserAdmin = user.permission === "admin";
        if (err || !user || (!isUserCreator && !isUserAdmin)) {
            // if user is not admin, return error
            return res.status(403).send({
                errors: [
                    {
                        msg: "Only the comment creator can delete it",
                    },
                ],
            });
        }
        req.body.userId = (_c = user._id) === null || _c === void 0 ? void 0 : _c.toString();
        return next();
    }))(req, res, next);
}, commentsController.comment_delete);
module.exports = router;
//# sourceMappingURL=comments.js.map