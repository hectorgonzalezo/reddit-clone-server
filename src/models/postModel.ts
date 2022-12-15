import mongoose from "mongoose";
import { IPost } from "../types/models";

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, minLength: 1, maxLength: 300, required: true },
  text: { type: String, minLength: 1, required: true },
  user: { type: Schema.Types.ObjectId, required: true },
  community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  upVotes: { type: Number, required: false, default: 0 },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

export default mongoose.model<IPost>("Post", PostSchema);
