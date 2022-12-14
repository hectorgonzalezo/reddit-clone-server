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
const commentModel_1 = __importDefault(require("../models/commentModel"));
const postModel_1 = __importDefault(require("../models/postModel"));
// List all comments in database
exports.comments_list = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Look for post and extract comments
        const { comments } = (yield postModel_1.default.findById(req.postId, {
            comments: 1,
        }).populate({
            path: "comments",
            populate: { path: "responses", model: "Comment" },
        }));
        // console.log(comments)
        return res.status(200).send({ comments });
    }
    catch (error) {
        return next(error);
    }
});
// Display details about an individual comment
// GET comment
exports.comment_detail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield commentModel_1.default.findById(req.params.id);
        if (comment === null) {
            return res.status(404).send({ error: `No comment with id ${req.params.id} found` });
        }
        return res.status(200).send({ comment });
    }
    catch (error) {
        return next(error);
    }
});
// create an individual comment
// comment comment
exports.comment_create = (req, res) => {
    res.send({ comment: `Comment created` });
};
// Update an individual comment
// PUT comment
exports.comment_update = (req, res) => {
    res.send({ comment: `Comment ${req.params.id} updated` });
};
// Display details about an individual comment
// DELETE comment
exports.comment_delete = (req, res) => {
    res.send({ comment: `Comment ${req.params.id} deleted` });
};
//# sourceMappingURL=commentController.js.map