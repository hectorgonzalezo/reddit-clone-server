"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentsController = require('../controllers/commentController');
const router = express_1.default.Router();
// GET all comments
router.get("/", commentsController.comments_list);
// GET a single comment
router.get("/:id", commentsController.comment_detail);
// POST/create a single comment
router.post("/", commentsController.comment_create);
// PUT/update a single comment
router.put("/:id", commentsController.comment_update);
// DELETE a single comment
router.delete("/:i", commentsController.comment_delete);
module.exports = router;
//# sourceMappingURL=comments.js.map