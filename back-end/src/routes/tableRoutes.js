"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tablesController_1 = require("../controllers/tablesController");
const router = express_1.default.Router();
router.get('/', tablesController_1.getTables);
router.get('/:id', tablesController_1.getTableById);
router.post('/', tablesController_1.createTable);
router.patch('/:id', tablesController_1.updateTable);
router.delete('/:id', tablesController_1.deleteTable);
exports.default = router;
