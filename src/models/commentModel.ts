import mongoose from 'mongoose';
import { IComment } from '../types/models';

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  text: { type: String, minLength: 1, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  upVotes: { type: Number, required: false, default: 0 },
  responses: [{ type: Schema.Types.ObjectId, ref: "Comment", autopopulate: true }],
});

CommentSchema.plugin(require('mongoose-autopopulate'));

export default mongoose.model<IComment>("Comment", CommentSchema);