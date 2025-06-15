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
exports.deleteCashier = exports.updateCashier = exports.createCashier = exports.getCashierById = exports.getCashiers = void 0;
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
// อ่านแคชเชียร์ตาม id
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
exports.createCashier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, first_name, last_name, email, phone, status } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const role = 'cashier';
    const result = yield db_1.pool.query(`INSERT INTO users (username, password, role, first_name, last_name, email, phone, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     RETURNING id, username, role, first_name, last_name, email, phone, status`, [username, hashedPassword, role, first_name, last_name, email, phone, status]);
    res.status(201).json(result.rows[0]);
}));
exports.updateCashier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { username, password, first_name, last_name, email, phone, status } = req.body;
    const existing = yield db_1.pool.query(`SELECT * FROM users WHERE id = $1 AND role = 'cashier'`, [id]);
    if (existing.rowCount === 0) {
        res.status(404).json({ message: 'Cashier not found' });
        return;
    }
    let hashedPassword = existing.rows[0].password;
    if (password) {
        hashedPassword = yield bcrypt_1.default.hash(password, 10);
    }
    const result = yield db_1.pool.query(`UPDATE users SET 
      username = $1,
      password = $2,
      first_name = $3,
      last_name = $4,
      email = $5,
      phone = $6,
      status = $7,
      updated_at = NOW()
     WHERE id = $8 AND role = 'cashier'
     RETURNING id, username, role, first_name, last_name, email, phone, status`, [username, hashedPassword, first_name, last_name, email, phone, status, id]);
    res.json(result.rows[0]);
}));
exports.deleteCashier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield db_1.pool.query(`DELETE FROM users WHERE id = $1 AND role = 'cashier'`, [id]);
    if (result.rowCount === 0) {
        res.status(404).json({ message: 'Cashier not found or cannot delete non-cashier user' });
        return;
    }
    res.json({ message: 'Cashier deleted successfully' });
}));
