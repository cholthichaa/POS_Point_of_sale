import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { pool } from '../config/db';

// อ่าน categories ทั้งหมด
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT id, name, status, created_at, updated_at
    FROM categories
  `);
  res.json(result.rows);
});

// อ่าน category ตาม id
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await pool.query(`
    SELECT id, name, status, created_at, updated_at
    FROM categories
    WHERE id = $1
  `, [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }

  res.json(result.rows[0]);
});

// สร้าง category ใหม่
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, status } = req.body;

  if (!['available', 'unavailable'].includes(status)) {
    res.status(400).json({ message: "Status must be 'available' or 'unavailable'" });
    return;
  }

  const exists = await pool.query(`SELECT id FROM categories WHERE name = $1`, [name]);
  if (exists?.rowCount && exists.rowCount > 0) {
    res.status(409).json({ message: 'Category name already exists' });
    return;
  }

  const result = await pool.query(`
    INSERT INTO categories (name, status, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING id, name, status
  `, [name, status]);

  res.status(201).json(result.rows[0]);
});

// แก้ไข category แบบ patch
export const patchUpdateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const fieldsToUpdate = req.body;

  if (fieldsToUpdate.status && !['available', 'unavailable'].includes(fieldsToUpdate.status)) {
    res.status(400).json({ message: "Status must be 'available' or 'unavailable'" });
    return;
  }

  const existing = await pool.query(`SELECT * FROM categories WHERE id = $1`, [id]);
  if (existing.rowCount === 0) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }

  if (fieldsToUpdate.name) {
    const nameExists = await pool.query(`SELECT id FROM categories WHERE name = $1 AND id <> $2`, [fieldsToUpdate.name, id]);
    if (nameExists?.rowCount && nameExists.rowCount > 0) {
      res.status(409).json({ message: 'Category name already exists' });
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
    UPDATE categories SET
      ${setClauses.join(', ')},
      updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, name, status
  `;

  const result = await pool.query(query, values);
  res.json(result.rows[0]);
});

// ลบ category
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }

  res.json({ message: 'Category deleted successfully' });
});
