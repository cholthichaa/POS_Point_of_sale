import express from 'express';
import { createOrderItem, getOrderItems, getOrderItemById, updateOrderItem, deleteOrderItem } from '../controllers/orderItemsController';

const router = express.Router();

router.post('/', createOrderItem);
router.get('/', getOrderItems);
router.get('/:id', getOrderItemById);
router.patch('/:id', updateOrderItem);
router.delete('/:id', deleteOrderItem);

export default router;
