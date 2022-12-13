"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const communitiesController = require('../controllers/communityController');
const router = express_1.default.Router();
// GET all communities
router.get("/", communitiesController.communities_list);
// GET a single community
router.get("/:id", communitiesController.community_detail);
// POST/create a single community
router.post("/", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
        var _a;
        if (err || !user) { // if user is not admin, return error
            return res.status(403).send({
                errors: [
                    {
                        msg: "Only logged in users can create communities",
                    },
                ],
            });
            // return next(err);
        }
        req.body.userId = (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString();
        return next(err);
    })(req, res, next);
}, communitiesController.community_create);
// PUT/update a single community
router.put("/:id", communitiesController.community_update);
// DELETE a single community
router.delete("/:id", communitiesController.community_delete);
module.exports = router;
//# sourceMappingURL=communities.js.map