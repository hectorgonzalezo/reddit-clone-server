import createError, { HttpError } from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Get .env
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({ error: "error" });
});

module.exports = app;
