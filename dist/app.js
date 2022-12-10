"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createError = require('http-errors');
const express_1 = __importDefault(require("express"));
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// Get .env
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const indexRouter = require('./routes/index');
const app = (0, express_1.default)();
app.use(logger('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express_1.default.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});
// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.send({ error: "error" });
});
module.exports = app;
//# sourceMappingURL=app.js.map