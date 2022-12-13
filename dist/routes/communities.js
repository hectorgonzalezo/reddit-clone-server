"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const communityModel_1 = __importDefault(require("../models/communityModel"));
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
        req.body.userId = (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString();
        return next();
    })(req, res, next);
}, communitiesController.community_create);
// PUT/update a single community
router.put("/:id", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const community = yield communityModel_1.default.findById(req.params.id);
        const isUserCreator = (community === null || community === void 0 ? void 0 : community.creator.toString()) === ((_a = user._id) === null || _a === void 0 ? void 0 : _a.toString());
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
        req.body.userId = (_b = user._id) === null || _b === void 0 ? void 0 : _b.toString();
        return next();
    }))(req, res, next);
}, communitiesController.community_update);
// DELETE a single community
router.delete("/:id", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const community = yield communityModel_1.default.findById(req.params.id);
        const isUserCreator = (community === null || community === void 0 ? void 0 : community.creator.toString()) === ((_a = user._id) === null || _a === void 0 ? void 0 : _a.toString());
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
        req.body.userId = (_b = user._id) === null || _b === void 0 ? void 0 : _b.toString();
        return next();
    }))(req, res, next);
}, communitiesController.community_delete);
module.exports = router;
//# sourceMappingURL=communities.js.map