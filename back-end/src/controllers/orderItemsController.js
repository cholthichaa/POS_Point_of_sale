"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderItem = exports.updateOrderItem = exports.createOrderItem = exports.getOrderItemById = exports.getOrderItems = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const db_1 = require("../config/db");
// ดึงรายการ order items ทั้งหมด
exports.getOrderItems = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_1.pool.query(`
    SELECT id, order_id, menu_id, quantity, price, created_at, updated_at
    FROM order_items
    ORDER BY id
  `);
    res.json(result.rows);
}));
// ดึง order item ตาม id
exports.getOrderItemById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield db_1.pool.query(`
    SELECT id, order_id, menu_id, quantity, price, created_at, updated_at
    FROM order_items
    WHERE id = $1
  `, [id]);
    if (result.rowCount === 0) {
        res.status(404).json({ message: 'Order item not found' });
        return;
    }
    res.json(result.rows[0]);
}));
// สร้าง order item ใหม่
exports.createOrderItem = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { order_id, menu_id, quantity, price } = req.body;
    // ตรวจสอบข้อมูลเบื้องต้น
    if (!order_id || !menu_id || !quantity || price == null) {
        res.status(400).json({ message: 'order_id, menu_id, quantity, and price are required' });
        return;
    }
    // ตรวจสอบว่า order_id และ menu_id มีอยู่ในฐานข้อมูล
    const orderExists = yield db_1.pool.query('SELECT id FROM orders WHERE id = $1', [order_id]);
    if (orderExists.rowCount === 0) {
        res.status(400).json({ message: 'Invalid order_id' });
        return;
    }
    const menuExists = yield db_1.pool.query('SELECT id FROM menus WHERE id = $1', [menu_id]);
    if (menuExists.rowCount === 0) {
        res.status(400).json({ message: 'Invalid menu_id' });
        return;
    }
    const result = yield db_1.pool.query(`
    INSERT INTO order_items (order_id, menu_id, quantity, price, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, order_id, menu_id, quantity, price
  `, [order_id, menu_id, quantity, price]);
    res.status(201).json(result.rows[0]);
}));
// อัพเดต order item (PATCH)
exports.updateOrderItem = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const fieldsToUpdate = req.body;
    const existing = yield db_1.pool.query('SELECT * FROM order_items WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
        res.status(404).json({ message: 'Order item not found' });
        return;
    }
    // ตรวจสอบว่า order_id และ menu_id มีอยู่จริงไหม (Optional)
    if (fieldsToUpdate.order_id) {
        const orderExists = yield db_1.pool.query('SELECT id FROM orders WHERE id = $1', [fieldsToUpdate.order_id]);
        if (orderExists.rowCount === 0) {
            res.status(400).json({ message: 'Invalid order_id' });
            return;
        }
    }
    if (fieldsToUpdate.menu_id) {
        const menuExists = yield db_1.pool.query('SELECT id FROM menus WHERE id = $1', [fieldsToUpdate.menu_id]);
        if (menuExists.rowCount === 0) {
            res.status(400).json({ message: 'Invalid menu_id' });
            return;
        }
    }
    // สร้าง query dynamic update
    const setClauses = [];
    const values = [];
    let idx = 1;
    for (const key in fieldsToUpdate) {
        setClauses.push(`${key} = $${idx}`);
        values.push(fieldsToUpdate[key]);
        idx++;
    }
    values.push(id);
    const query = `
    UPDATE order_items SET
      ${setClauses.join(', ')},
      updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, order_id, menu_id, quantity, price
  `;
    const result = yield db_1.pool.query(query, values);
    res.json(result.rows[0]);
}));
// ลบ order item
exports.deleteOrderItem = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield db_1.pool.query('DELETE FROM order_items WHERE id = $1', [id]);
    if (result.rowCount === 0) {
        res.status(404).json({ message: 'Order item not found' });
        return;
    }
    res.json({ message: 'Order item deleted successfully' });
}));
