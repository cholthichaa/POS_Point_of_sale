import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { pool } from '../config/db';

export const getZones = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT id, name, status, created_at, updated_at
    FROM zones
  `);
  res.json(result.rows);
});

export const getZoneById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await pool.query(`
    SELECT id, name, status, created_at, updated_at
    FROM zones
    WHERE id = $1
  `, [id]);

  if (!result || result.rowCount === 0) {
    res.status(404).json({ message: 'Zone not found' });
    return;
  }

  res.json(result.rows[0]);
});

export const createZone = asyncHandler(async (req: Request, res: Response) => {
  const { name, status } = req.body;

  // ตรวจสอบค่าที่ได้รับจาก body
  if (!name || !status) {
    res.status(400).json({ message: 'Name and Status are required' });
    return;
  }

  // ตรวจสอบว่า status ถูกต้องหรือไม่
  if (!['available', 'unavailable'].includes(status)) {
    res.status(400).json({ message: "Status must be 'available' or 'unavailable'" });
    return;
  }

  // ตรวจสอบว่าโซนนี้มีชื่อซ้ำหรือไม่
  const exists = await pool.query(`SELECT id FROM zones WHERE name = $1`, [name]);
  if (exists?.rowCount && exists.rowCount > 0) {
    res.status(409).json({ message: 'Zone name already exists' });
    return;
  }

  // ถ้าไม่พบข้อมูลซ้ำ สามารถเพิ่มโซนใหม่ได้
  const result = await pool.query(`
    INSERT INTO zones (name, status, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING id, name, status
  `, [name, status]);

  res.status(201).json(result.rows[0]);
});


export const patchUpdateZone = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const fieldsToUpdate = req.body;

  if (fieldsToUpdate.status && !['available', 'unavailable'].includes(fieldsToUpdate.status)) {
    res.status(400).json({ message: "Status must be 'available' or 'unavailable'" });
    return;
  }

  const existing = await pool.query(`SELECT * FROM zones WHERE id = $1`, [id]);
  if (!existing || existing.rowCount === 0) {
    res.status(404).json({ message: 'Zone not found' });
    return;
  }

  if (fieldsToUpdate.name) {
    const nameExists = await pool.query(
      `SELECT id FROM zones WHERE name = $1 AND id <> $2`,
      [fieldsToUpdate.name, id]
    );
    if (nameExists?.rowCount && nameExists.rowCount > 0) {
      res.status(409).json({ message: 'Zone name already exists' });
      return;
    }
  }

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
    UPDATE zones SET
      ${setClauses.join(', ')},
      updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, name, status
  `;

  const result = await pool.query(query, values);
  res.json(result.rows[0]);
});


export const deleteZone = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await pool.query(`DELETE FROM zones WHERE id = $1`, [id]);
  if (!result || result.rowCount === 0) {
    res.status(404).json({ message: 'Zone not found' });
    return;
  }

  res.json({ message: 'Zone deleted successfully' });
});
