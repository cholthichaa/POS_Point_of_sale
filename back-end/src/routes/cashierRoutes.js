"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cashierController_1 = require("../controllers/cashierController");
const router = express_1.default.Router();
router.get('/', cashierController_1.getCashiers);
router.get('/:id', cashierController_1.getCashierById);
router.post('/', cashierController_1.createCashier);
router.patch('/:id', cashierController_1.patchUpdateCashier);
router.delete('/:id', cashierController_1.deleteCashier);
exports.default = router;
