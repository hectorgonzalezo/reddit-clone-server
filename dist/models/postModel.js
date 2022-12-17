"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require('mongoose-type-url');
const Schema = mongoose_1.default.Schema;
const PostSchema = new Schema({
    title: { type: String, minLength: 1, maxLength: 300, required: true },
    text: { type: String, minLength: 1, required: true },
    user: { type: Schema.Types.ObjectId, required: true },
    community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
    upVotes: { type: Number, required: false, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    url: { type: String, required: false },
}, { timestamps: true, toJSON: { virtuals: true } });
PostSchema.virtual("commentsNum").get(function () {
    return this.comments.length;
});
exports.default = mongoose_1.default.model("Post", PostSchema);
//# sourceMappingURL=postModel.js.map