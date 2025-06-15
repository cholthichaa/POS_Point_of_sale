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
exports.deleteTable = exports.updateTable = exports.createTable = exports.getTableById = exports.getTables = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const db_1 = require("../config/db");
// Get all tables
exports.getTables = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_1.pool.query(`
    SELECT id, zone_id, table_number, status, created_at, updated_at
    FROM tables
    ORDER BY id
  `);
    res.json(result.rows);
}));
// Get table by id
exports.getTableById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield db_1.pool.query(`
    SELECT id, zone_id, table_number, status, created_at, updated_at
    FROM tables
    WHERE id = $1
  `, [id]);
    if (result.rowCount === 0) {
        res.status(404).json({ message: 'Table not found' });
        return;
    }
    res.json(result.rows[0]);
}));
// Create new table
exports.createTable = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { zone_id, table_number, status } = req.body;
    // Validate required fields
    if (!zone_id || !table_number || !status) {
        res.status(400).json({ message: 'zone_id, table_number and status are required' });
        return;
    }
    // Check if table_number is unique
    const existing = yield db_1.pool.query('SELECT id FROM tables WHERE table_number = $1', [table_number]);
    if (((_a = existing === null || existing === void 0 ? void 0 : existing.rowCount) !== null && _a !== void 0 ? _a : 0) > 0) {
        res.status(409).json({ message: 'Table number already exists' });
        return;
    }
    // Insert new table
    const result = yield db_1.pool.query(`
    INSERT INTO tables (zone_id, table_number, status, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id, zone_id, table_number, status
  `, [zone_id, table_number, status]);
    res.status(201).json(result.rows[0]);
}));
// Update table by id (PATCH)
exports.updateTable = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    const fieldsToUpdate = req.body;
    // Check table exists
    const existing = yield db_1.pool.query('SELECT * FROM tables WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
        res.status(404).json({ message: 'Table not found' });
        return;
    }
    // If updating table_number, check uniqueness
    if (fieldsToUpdate.table_number) {
        const conflict = yield db_1.pool.query('SELECT id FROM tables WHERE table_number = $1 AND id <> $2', [fieldsToUpdate.table_number, id]);
        if (((_a = conflict === null || conflict === void 0 ? void 0 : conflict.rowCount) !== null && _a !== void 0 ? _a : 0) > 0) {
            res.status(409).json({ message: 'Table number already exists' });
            return;
        }
    }
    // Build dynamic SET clause
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
    UPDATE tables SET
      ${setClauses.join(', ')},
      updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, zone_id, table_number, status
  `;
    const result = yield db_1.pool.query(query, values);
    res.json(result.rows[0]);
}));
// Delete table by id
exports.deleteTable = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield db_1.pool.query('DELETE FROM tables WHERE id = $1', [id]);
    if (result.rowCount === 0) {
        res.status(404).json({ message: 'Table not found' });
        return;
    }
    res.json({ message: 'Table deleted successfully' });
}));
