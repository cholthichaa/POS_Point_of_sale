"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const router = express_1.default.Router();
router.get('/', categoryController_1.getCategories);
router.get('/:id', categoryController_1.getCategoryById);
router.post('/', categoryController_1.createCategory);
router.patch('/:id', categoryController_1.patchUpdateCategory);
router.delete('/:id', categoryController_1.deleteCategory);
exports.default = router;
