import { pool } from '../config/db';
import asyncHandler from 'express-async-handler';

// Create order item
export const createOrderItem = asyncHandler(async (req, res) => {
    const { order_id, menu_id, quantity, price } = req.body;

    // Validate required fields
    if (!order_id || !menu_id || !quantity || !price) {
        return res.status(400).json({ message: 'order_id, menu_id, quantity, and price are required' });
    }

    const result = await pool.query(`
        INSERT INTO order_items (order_id, menu_id, quantity, price, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, order_id, menu_id, quantity, price, created_at, updated_at
    `, [order_id, menu_id, quantity, price]);

    res.status(201).json(result.rows[0]);
});

export const getOrderItems = asyncHandler(async (req, res) => {
    const { orderId } = req.query;

    // Ensure the order exists
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderResult.rowCount === 0) {
        return res.status(400).json({ message: 'Order does not exist' });
    }

    const result = await pool.query(`
        SELECT order_items.id, order_items.order_id, order_items.menu_id, order_items.quantity, order_items.price,
               order_items.created_at, order_items.updated_at, orders.table_id
        FROM order_items
        JOIN orders ON order_items.order_id = orders.id
        WHERE orders.id = $1
        ORDER BY order_items.id
    `, [orderId]);

    res.json(result.rows);
});

// Get order item by ID
export const getOrderItemById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(`
        SELECT id, order_id, menu_id, quantity, price, created_at, updated_at
        FROM order_items
        WHERE id = $1
    `, [id]);

    if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Order item not found' });
    }

    res.json(result.rows[0]);
});

// Update order item by ID
export const updateOrderItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity, price } = req.body;

    // Check if order item exists
    const existing = await pool.query('SELECT * FROM order_items WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
        return res.status(404).json({ message: 'Order item not found' });
    }

    const result = await pool.query(`
        UPDATE order_items
        SET quantity = $1, price = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, order_id, menu_id, quantity, price, created_at, updated_at
    `, [quantity, price, id]);

    res.json(result.rows[0]);
});

// Delete order item by ID
export const deleteOrderItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM order_items WHERE id = $1', [id]);

    if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Order item not found' });
    }

    res.json({ message: 'Order item deleted successfully' });
});
