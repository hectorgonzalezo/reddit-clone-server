import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

/* GET home page. */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send({ homepage: true });
});

module.exports = router;
