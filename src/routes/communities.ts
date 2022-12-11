import express from 'express';
const communitiesController = require('../controllers/communityController');
const router = express.Router();

// GET all communities
router.get("/", communitiesController.communities_list);

// GET a single community
router.get("/", communitiesController.community_detail);

// POST/create a single community
router.post("/", communitiesController.community_create);

// PUT/update a single community
router.put("/", communitiesController.community_update);

// DELETE a single community
router.delete("/", communitiesController.community_delete);

module.exports = router;
