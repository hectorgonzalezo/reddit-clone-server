import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
const communitiesController = require('../controllers/communityController');
const router = express.Router();
import { IUser } from 'src/types/models';

// GET all communities
router.get("/", communitiesController.communities_list);

// GET a single community
router.get("/:id", communitiesController.community_detail);

// POST/create a single community
router.post(
  "/",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      (err: any, user: IUser) => {
        if (err || !user) {          // if user is not admin, return error
          return res.status(403).send({
            errors: [
              {
                msg: "Only logged in users can create communities",
              },
            ],
          });
          // return next(err);
        }
        req.body.userId = user._id?.toString();
        return next(err);
      },
    )(req, res, next);
  },
  communitiesController.community_create
);

// PUT/update a single community
router.put("/:id", communitiesController.community_update);

// DELETE a single community
router.delete("/:id", communitiesController.community_delete);

module.exports = router;
