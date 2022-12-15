"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const bcrypt = require("bcryptjs");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const userModel_1 = __importDefault(require("./models/userModel"));
// Get .env
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
// user local strategy to log in (username and password)
passport.use(new LocalStrategy((username, password, cb) => {
    userModel_1.default.findOne({ username }, (err, user) => {
        if (err) {
            return cb(err);
        }
        if (!user) {
            return cb(null, false, { message: "Incorrect username" });
        }
        // compare password with hashed password in database
        bcrypt.compare(password, user.password, (compareErr, res) => {
            if (res) {
                // passwords match! log user in
                return cb(null, user, { message: "Logged In Successfully" });
            }
            // passwords do not match!
            return cb(null, false, { message: "Incorrect password" });
        });
    });
}));
// Used to authorize user
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.AUTH_SECRET,
}, (jwtPayload, cb) => {
    // find the user in db
    return userModel_1.default.findById(jwtPayload._id, (err, user) => {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
}));
//# sourceMappingURL=passport.js.map