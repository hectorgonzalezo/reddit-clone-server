import mongoose from "mongoose";
import { IComment } from "../types/models";
require("./userModel");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  text: { type: String, minLength: 1, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, autopopulate: true },
  upVotes: { type: Number, required: false, default: 0 },
  responses: [
    { type: Schema.Types.ObjectId, ref: "Comment", autopopulate: true },
  ],
}, { timestamps: true, toJSON: { virtuals: true } });

// autopopulate nested responses
CommentSchema.plugin(require("mongoose-autopopulate"));

export default mongoose.model<IComment>("Comment", CommentSchema);
