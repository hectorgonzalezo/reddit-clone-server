"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Texts if the email is valid using regexp
const validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
const Schema = mongoose_1.default.Schema;
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
exports.default = mongoose_1.default.model("UserModel", UserSchema);
//# sourceMappingURL=userModel.js.map