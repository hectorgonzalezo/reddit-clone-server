"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const CommunitySchema = new Schema({
    name: {
        type: String,
        minLength: 3,
        maxLength: 21,
        validate: {
            // Community name can only contain letters, numbers and "_"
            validator: (value) => {
                return /^[a-zA-Z0-9_]+$/.test(value);
            },
            message: (props) => "Only letters, numbers and underscore allowed in community name",
        },
        required: true,
    },
    subtitle: { type: String, minLength: 3, maxLength: 100, required: true },
    description: { type: String, minLength: 3, maxLength: 300, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    icon: { type: String, required: false },
}, { timestamps: true, toJSON: { virtuals: true } });
CommunitySchema.virtual("membersQuantity").get(function () {
    return this.users.length;
});
CommunitySchema.virtual("postsQuantity").get(function () {
    return this.posts.length;
});
exports.default = mongoose_1.default.model("Community", CommunitySchema);
//# sourceMappingURL=communityModel.js.map