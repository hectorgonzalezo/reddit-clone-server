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
const postModel_1 = __importDefault(require("../models/postModel"));
const postsController = require("../controllers/postController");
const router = express_1.default.Router();
// GET all posts
router.get("/", postsController.posts_list);
// GET a single post
router.get("/:id([a-zA-Z0-9]{24})", postsController.post_detail);
// POST/create a single post
router.post("/", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
        var _a;
        if (err || !user) {
            // if user is not authorized
            return res.status(403).send({
                errors: [
                    {
                        msg: "Only logged in users can create posts",
                    },
                ],
            });
        }
        req.body.userId = (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString();
        return next();
    })(req, res, next);
}, postsController.post_create);
// PUT/update a single post
router.put("/:id([a-zA-Z0-9]{24})", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const post = yield postModel_1.default.findById(req.params.id, { user: 1 });
        const isUserCreator = (post === null || post === void 0 ? void 0 : post.user.toString()) === ((_a = user._id) === null || _a === void 0 ? void 0 : _a.toString());
        const isUserAdmin = user.permission === "admin";
        if (err || !user || (!isUserCreator && !isUserAdmin)) {
            // if user is not admin, return error
            return res.status(403).send({
                errors: [
                    {
                        msg: "Only the post creator can update the post",
                    },
                ],
            });
        }
        req.body.userId = (_b = user._id) === null || _b === void 0 ? void 0 : _b.toString();
        return next();
    }))(req, res, next);
}, postsController.post_update);
// DELETE a single post
router.delete("/:id([a-zA-Z0-9]{24})", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const post = yield postModel_1.default.findById(req.params.id, { user: 1 });
        const isUserCreator = (post === null || post === void 0 ? void 0 : post.user.toString()) === ((_a = user._id) === null || _a === void 0 ? void 0 : _a.toString());
        const isUserAdmin = user.permission === "admin";
        if (err || !user || (!isUserCreator && !isUserAdmin)) {
            // if user is not admin, return error
            return res.status(403).send({
                errors: [
                    {
                        msg: "Only the post creator can delete the post",
                    },
                ],
            });
        }
        req.body.userId = (_b = user._id) === null || _b === void 0 ? void 0 : _b.toString();
        return next();
    }))(req, res, next);
}, postsController.post_delete);
module.exports = router;
//# sourceMappingURL=posts.js.map