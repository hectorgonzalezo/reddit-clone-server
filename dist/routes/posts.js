"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const postsController = require('../controllers/postController');
const router = express_1.default.Router();
// GET all posts
router.get("/", postsController.posts_list);
// GET a single post
router.get("/:id([a-zA-Z0-9]{24})", postsController.post_detail);
// POST/create a single post
router.post("/", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
        var _a;
        if (err || !user) {
            // if user is not authorized
            return res.status(403).send({
                errors: [
                    {
                        msg: "Only logged in users can create posts",
                    },
                ],
            });
        }
        req.body.userId = (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString();
        return next();
    })(req, res, next);
}, postsController.post_create);
// PUT/update a single post
router.put("/:id([a-zA-Z0-9]{24})", postsController.post_update);
// DELETE a single post
router.delete("/:id([a-zA-Z0-9]{24})", postsController.post_delete);
module.exports = router;
//# sourceMappingURL=posts.js.map