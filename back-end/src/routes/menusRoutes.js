"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menusController_1 = require("../controllers/menusController");
const router = express_1.default.Router();
router.get('/', menusController_1.getMenus);
router.get('/:id', menusController_1.getMenuById);
router.post('/', menusController_1.createMenu);
router.patch('/:id', menusController_1.updateMenu);
router.delete('/:id', menusController_1.deleteMenu);
exports.default = router;
