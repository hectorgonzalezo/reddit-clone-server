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
exports.post_create = (req, res) => {
    res.send({ post: `Post created` });
};
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