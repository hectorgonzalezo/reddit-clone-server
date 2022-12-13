import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import Community from '../models/communityModel';
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
        if (err || !user) {
          // if user is not authorized
          return res.status(403).send({
            errors: [
              {
                msg: "Only logged in users can create communities",
              },
            ],
          });
        }
        req.body.userId = user._id?.toString();
        return next();
      },
    )(req, res, next);
  },
  communitiesController.community_create
);

// PUT/update a single community
router.put(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err: any, user: IUser) => {
        const community = await Community.findById(req.params.id);
        const isUserCreator = community?.creator.toString() === user._id?.toString();
        const isUserAdmin = user.permission === 'admin';
        if (err || !user || !isUserCreator || isUserAdmin) {
          // if user is not admin, return error
          return res.status(403).send({
            errors: [
              {
                msg: "Only the community creator can update the community",
              },
            ],
          });
        }
        // if the users isn't the creator of community, send error
        req.body.userId = user._id?.toString();
        return next();
      }
    )(req, res, next);
  },
  communitiesController.community_update
);

// DELETE a single community
router.delete(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err: any, user: IUser) => {
        const community = await Community.findById(req.params.id);
        const isUserCreator =
          community?.creator.toString() === user._id?.toString();
        const isUserAdmin = user.permission === 'admin';
        if (err || !user || !isUserCreator || isUserAdmin) {
          // if user is not admin, return error
          return res.status(403).send({
            errors: [
              {
                msg: "Only the community creator can delete the community",
              },
            ],
          });
        }
        // if the users isn't the creator of community, send error
        req.body.userId = user._id?.toString();
        return next();
      }
    )(req, res, next);
  },
  communitiesController.community_delete
);

module.exports = router;
