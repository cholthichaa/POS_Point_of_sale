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
exports.deleteZone = exports.patchUpdateZone = exports.createZone = exports.getZoneById = exports.getZones = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const db_1 = require("../config/db");
exports.getZones = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_1.pool.query(`
    SELECT id, name, status, created_at, updated_at
    FROM zones
  `);
    res.json(result.rows);
}));
exports.getZoneById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield db_1.pool.query(`
    SELECT id, name, status, created_at, updated_at
    FROM zones
    WHERE id = $1
  `, [id]);
    if (!result || result.rowCount === 0) {
        res.status(404).json({ message: 'Zone not found' });
        return;
    }
    res.json(result.rows[0]);
}));
exports.createZone = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, status } = req.body;
    if (!['available', 'unavailable'].includes(status)) {
        res.status(400).json({ message: "Status must be 'available' or 'unavailable'" });
        return;
    }
    const exists = yield db_1.pool.query(`SELECT id FROM zones WHERE name = $1`, [name]);
    if ((exists === null || exists === void 0 ? void 0 : exists.rowCount) && exists.rowCount > 0) {
        res.status(409).json({ message: 'Zone name already exists' });
        return;
    }
    const result = yield db_1.pool.query(`
    INSERT INTO zones (name, status, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING id, name, status
  `, [name, status]);
    res.status(201).json(result.rows[0]);
}));
exports.patchUpdateZone = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const fieldsToUpdate = req.body;
    if (fieldsToUpdate.status && !['available', 'unavailable'].includes(fieldsToUpdate.status)) {
        res.status(400).json({ message: "Status must be 'available' or 'unavailable'" });
        return;
    }
    const existing = yield db_1.pool.query(`SELECT * FROM zones WHERE id = $1`, [id]);
    if (!existing || existing.rowCount === 0) {
        res.status(404).json({ message: 'Zone not found' });
        return;
    }
    if (fieldsToUpdate.name) {
        const nameExists = yield db_1.pool.query(`SELECT id FROM zones WHERE name = $1 AND id <> $2`, [fieldsToUpdate.name, id]);
        if ((nameExists === null || nameExists === void 0 ? void 0 : nameExists.rowCount) && nameExists.rowCount > 0) {
            res.status(409).json({ message: 'Zone name already exists' });
            return;
        }
    }
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
    UPDATE zones SET
      ${setClauses.join(', ')},
      updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, name, status
  `;
    const result = yield db_1.pool.query(query, values);
    res.json(result.rows[0]);
}));
exports.deleteZone = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield db_1.pool.query(`DELETE FROM zones WHERE id = $1`, [id]);
    if (!result || result.rowCount === 0) {
        res.status(404).json({ message: 'Zone not found' });
        return;
    }
    res.json({ message: 'Zone deleted successfully' });
}));
