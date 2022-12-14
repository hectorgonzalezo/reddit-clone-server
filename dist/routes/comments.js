"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const commentsController = require('../controllers/commentController');
const router = express_1.default.Router();
// GET all comments
router.get("/", commentsController.comments_list);
// GET a single comment
router.get("/:id([a-zA-Z0-9]{24})", commentsController.comment_detail);
// POST/create a single comment
router.post("/", (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
        var _a;
        if (err || !user) {
            // if user is not authorized
            return res.status(403).send({
                errors: [
                    {
                        msg: "Only logged in users can add comments",
                    },
                ],
            });
        }
        req.body.userId = (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString();
        return next();
    })(req, res, next);
}, commentsController.comment_create);
// PUT/update a single comment
router.put("/:id([a-zA-Z0-9]{24})", commentsController.comment_update);
// DELETE a single comment
router.delete("/:id([a-zA-Z0-9]{24})", commentsController.comment_delete);
module.exports = router;
//# sourceMappingURL=comments.js.map