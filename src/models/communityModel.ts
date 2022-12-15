import mongoose from "mongoose";
import { ICommunity } from "../types/models";

const Schema = mongoose.Schema;

const CommunitySchema = new Schema({
  name: {
    type: String,
    minLength: 3,
    maxLength: 21,
    validate: {
      // Community name can only contain letters, numbers and "_"
      validator: (value: string) => {
        return /^[a-zA-Z0-9_]+$/.test(value);
      },
      message: (props: { value: string }) =>
        "Only letters, numbers and underscore allowed in community name",
    },
    required: true,
  },
  subtitle: { type: String, minLength: 3, maxLength: 100, required: true },
  description: { type: String, minLength: 3, maxLength: 300, required: true },
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  icon: { type: String, required: false },
}, { timestamps: true });

CommunitySchema.virtual("membersQuantity").get(function () {
  return this.users.length;
});

CommunitySchema.virtual("postsQuantity").get(function () {
  return this.posts.length;
});

export default mongoose.model<ICommunity>("Community", CommunitySchema);
