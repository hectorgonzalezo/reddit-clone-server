import express from 'express';
const postsController = require('../controllers/postController');
const router = express.Router();

// GET all posts
router.get("/", postsController.posts_list);

// GET a single post
router.get("/:id", postsController.post_detail);

// POST/create a single post
router.post("/", postsController.post_create);

// PUT/update a single post
router.put("/:id", postsController.post_update);

// DELETE a single post
router.delete("/:id", postsController.post_delete);

module.exports = router;
