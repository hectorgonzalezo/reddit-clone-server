"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const enforceSSL = require("express-enforces-ssl");
const ms = require("ms");
// Get .env
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
require("./mongoConfig");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const communitiesRouter = require("./routes/communities");
const postsRouter = require("./routes/posts");
const commentsRouter = require("./routes/comments");
const app = (0, express_1.default)();
// Add cors
app.use(cors());
// compress all routes
app.use(compression());
app.use(helmet());
// force secure http if not in development mode
if (process.env.NODE_ENV !== "development") {
    app.enable("trust proxy");
    app.use(enforceSSL());
    app.use(helmet.hsts({
        maxAge: ms("1 year"),
        includeSubDomains: true,
    }));
}
app.use(logger("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express_1.default.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/users/", usersRouter);
app.use("/communities", communitiesRouter);
app.use("/posts/:postId/comments/", (req, res, next) => {
    req.postId = req.params.postId;
    next();
}, commentsRouter);
app.use("/posts/", postsRouter);
// catch 404 and forward to error handler
app.use((req, res, next) => {
    next((0, http_errors_1.default)(404));
});
// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.send({ error: "error" });
});
module.exports = app;
//# sourceMappingURL=app.js.map