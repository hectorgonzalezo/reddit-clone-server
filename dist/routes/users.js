"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersController = require('../controllers/userController');
const router = express_1.default.Router();
// GET all users
router.get("/", usersController.users_list);
// GET a single user
router.get("/:id", usersController.user_detail);
// POST/create a single user
router.post("/", usersController.user_create);
// PUT/update a single user
router.put("/:id", usersController.user_update);
// DELETE a single user
router.delete("/:id", usersController.user_delete);
module.exports = router;
//# sourceMappingURL=users.js.map