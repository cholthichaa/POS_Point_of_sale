"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderItemsController_1 = require("../controllers/orderItemsController");
const router = express_1.default.Router();
router.get('/', orderItemsController_1.getOrderItems);
router.get('/:id', orderItemsController_1.getOrderItemById);
router.post('/', orderItemsController_1.createOrderItem);
router.patch('/:id', orderItemsController_1.updateOrderItem);
router.delete('/:id', orderItemsController_1.deleteOrderItem);
exports.default = router;
