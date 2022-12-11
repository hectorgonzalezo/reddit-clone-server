"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const communitiesController = require('../controllers/communityController');
const router = express_1.default.Router();
// GET all communities
router.get("/", communitiesController.communities_list);
// GET a single community
router.get("/:id", communitiesController.community_detail);
// POST/create a single community
router.post("/", communitiesController.community_create);
// PUT/update a single community
router.put("/:id", communitiesController.community_update);
// DELETE a single community
router.delete("/:id", communitiesController.community_delete);
module.exports = router;
//# sourceMappingURL=communities.js.map