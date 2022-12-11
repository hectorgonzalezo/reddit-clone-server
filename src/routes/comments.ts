import express from 'express';
const commentsController = require('../controllers/commentController');
const router = express.Router();

// GET all comments
router.get("/", commentsController.comments_list);

// GET a single comment
router.get("/", commentsController.comment_detail);

// POST/create a single comment
router.post("/", commentsController.comment_create);

// PUT/update a single comment
router.put("/", commentsController.comment_update);

// DELETE a single comment
router.delete("/", commentsController.comment_delete);

module.exports = router;
