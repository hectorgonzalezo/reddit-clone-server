import { MongoError } from "mongodb";
import { IUser } from "./types/models";
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const bcrypt = require("bcryptjs");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
import User from "./models/userModel";

// Get .env
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// user local strategy to log in (username and password)
passport.use(
  new LocalStrategy((username: string, password: string, cb: Function) => {
    User.findOne({ username }, (err: MongoError, user: IUser) => {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false, { message: "Incorrect username" });
      }
      // compare password with hashed password in database
      bcrypt.compare(
        password,
        user.password,
        (compareErr: any, res: Response) => {
          if (res) {
            // passwords match! log user in
            return cb(null, user, { message: "Logged In Successfully" });
          }
          // passwords do not match!
          return cb(null, false, { message: "Incorrect password" });
        }
      );
    });
  })
);

// Used to authorize user
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.AUTH_SECRET as string,
    },
    (jwtPayload: any, cb: Function) => {
      // find the user in db 
      return User.findById(jwtPayload._id, (err: MongoError, user: any) => {
        if (err) {
          return cb(err);
        }
        cb(null, user);
      });
    }
  )
);
