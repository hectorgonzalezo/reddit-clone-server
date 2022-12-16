"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const CommentSchema = new Schema({
    text: { type: String, minLength: 1, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    upVotes: { type: Number, required: false, default: 0 },
    responses: [
        { type: Schema.Types.ObjectId, ref: "Comment", autopopulate: true },
    ],
}, { timestamps: true, toJSON: { virtuals: true } });
// autopopulate nested responses
CommentSchema.plugin(require("mongoose-autopopulate"));
exports.default = mongoose_1.default.model("Comment", CommentSchema);
//# sourceMappingURL=commentModel.js.map