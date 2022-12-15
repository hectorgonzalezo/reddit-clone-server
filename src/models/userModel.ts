import mongoose from "mongoose";
import { IUser } from "../types/models";

// Texts if the email is valid using regexp
const validateEmail = function (email: string) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, unique: true, minLength: 3, required: true },
  password: { type: String, minLength: 6, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validateEmail, "Please fill a valid email address"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  permission: {
    type: String,
    enum: {
      values: ["regular", "admin"],
      message: "{VALUE} is not supported",
    },
    default: "regular",
  },
  icon: { type: String, required: false },
  communities: [{ type: Schema.Types.ObjectId, ref: "Community" }],
});

export default mongoose.model<IUser>("User", UserSchema);
