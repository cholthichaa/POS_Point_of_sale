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
exports.deleteCashier = exports.patchUpdateCashier = exports.createCashier = exports.getCashierById = exports.getCashiers = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
// อ่านแคชเชียร์ทั้งหมด
exports.getCashiers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_1.pool.query(`
    SELECT id, username, role, first_name, last_name, email, phone, status, created_at, updated_at
    FROM users
    WHERE role = 'cashier'
  `);
    res.json(result.rows);
}));
exports.getCashierById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield db_1.pool.query(`
    SELECT id, username, role, first_name, last_name, email, phone, status, created_at, updated_at
    FROM users
    WHERE id = $1 AND role = 'cashier'
  `, [id]);
    if (result.rowCount === 0) {
        res.status(404).json({ message: 'Cashier not found' });
        return;
    }
    res.json(result.rows[0]);
}));
// สร้างแคชเชียร์ใหม่ พร้อม log
exports.createCashier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, first_name, last_name, email, phone, status } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const role = 'cashier';
    const result = yield db_1.pool.query(`
    INSERT INTO users (username, password, role, first_name, last_name, email, phone, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING id, username, role, first_name, last_name, email, phone, status
  `, [username, hashedPassword, role, first_name, last_name, email, phone, status]);
    console.log(`[LOG] Created cashier: ${result.rows[0].username} (ID: ${result.rows[0].id})`);
    res.status(201).json(result.rows[0]);
}));
// แก้ไขแคชเชียร์แบบ PATCH (partial update) พร้อม log
exports.patchUpdateCashier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const fieldsToUpdate = req.body;
    // เช็คว่าแคชเชียร์มีอยู่จริงไหม
    const existing = yield db_1.pool.query(`SELECT * FROM users WHERE id = $1 AND role = 'cashier'`, [id]);
    if (existing.rowCount === 0) {
        res.status(404).json({ message: 'Cashier not found' });
        return;
    }
    // ถ้ามี password ให้ hash ก่อน
    if (fieldsToUpdate.password) {
        fieldsToUpdate.password = yield bcrypt_1.default.hash(fieldsToUpdate.password, 10);
    }
    // สร้างคำสั่ง SQL แบบ dynamic ตามฟิลด์ที่ส่งมา
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
    UPDATE users SET
      ${setClauses.join(', ')},
      updated_at = NOW()
    WHERE id = $${idx} AND role = 'cashier'
    RETURNING id, username, role, first_name, last_name, email, phone, status
  `;
    const result = yield db_1.pool.query(query, values);
    console.log(`[LOG] Updated cashier ID ${id}: Fields updated -> ${Object.keys(fieldsToUpdate).join(', ')}`);
    res.json(result.rows[0]);
}));
// ลบแคชเชียร์ พร้อม log
exports.deleteCashier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield db_1.pool.query(`DELETE FROM users WHERE id = $1 AND role = 'cashier'`, [id]);
    if (result.rowCount === 0) {
        res.status(404).json({ message: 'Cashier not found or cannot delete non-cashier user' });
        return;
    }
    console.log(`[LOG] Deleted cashier ID ${id}`);
    res.json({ message: 'Cashier deleted successfully' });
}));
