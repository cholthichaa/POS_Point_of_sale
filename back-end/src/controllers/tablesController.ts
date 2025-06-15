import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { pool } from '../config/db';

// Get all tables
export const getTables = asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(`
    SELECT id, zone_id, table_number, status, created_at, updated_at
    FROM tables
    ORDER BY id
  `);
    res.json(result.rows);
});

// Get table by id
export const getTableById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await pool.query(`
    SELECT id, zone_id, table_number, status, created_at, updated_at
    FROM tables
    WHERE id = $1
  `, [id]);

    if (result.rowCount === 0) {
        res.status(404).json({ message: 'Table not found' });
        return;
    }

    res.json(result.rows[0]);
});

// Create new table
export const createTable = asyncHandler(async (req: Request, res: Response) => {
    const { zone_id, table_number, status } = req.body;

    // Validate required fields
    if (!zone_id || !table_number || !status) {
        res.status(400).json({ message: 'zone_id, table_number and status are required' });
        return;
    }

    // Check if table_number is unique
    const existing = await pool.query('SELECT id FROM tables WHERE table_number = $1', [table_number]);
    if ((existing?.rowCount ?? 0) > 0) {
        res.status(409).json({ message: 'Table number already exists' });
        return;
    }

    // Insert new table
    const result = await pool.query(`
    INSERT INTO tables (zone_id, table_number, status, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id, zone_id, table_number, status
  `, [zone_id, table_number, status]);

    res.status(201).json(result.rows[0]);
});

// Update table by id (PATCH)
export const updateTable = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const fieldsToUpdate = req.body;

    // Check table exists
    const existing = await pool.query('SELECT * FROM tables WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
        res.status(404).json({ message: 'Table not found' });
        return;
    }

    // If updating table_number, check uniqueness
    if (fieldsToUpdate.table_number) {
        const conflict = await pool.query(
            'SELECT id FROM tables WHERE table_number = $1 AND id <> $2',
            [fieldsToUpdate.table_number, id]
        );
        if ((conflict?.rowCount ?? 0) > 0) {
            res.status(409).json({ message: 'Table number already exists' });
            return;
        }
    }

    // Build dynamic SET clause
    const setClauses = [];
    const values: any[] = [];
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

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
});

// Delete table by id
export const deleteTable = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await pool.query('DELETE FROM tables WHERE id = $1', [id]);

    if (result.rowCount === 0) {
        res.status(404).json({ message: 'Table not found' });
        return;
    }

    res.json({ message: 'Table deleted successfully' });
});
