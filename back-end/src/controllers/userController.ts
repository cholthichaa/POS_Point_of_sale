import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { pool } from '../config/db';
import bcrypt from 'bcrypt';

// อ่านแคชเชียร์ทั้งหมด
export const getCashiers = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT id, username, role, first_name, last_name, email, phone, status, created_at, updated_at 
    FROM users 
    WHERE role = 'cashier'
  `);
  res.json(result.rows);
});

// อ่านแคชเชียร์ตาม id
export const getCashierById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await pool.query(`
    SELECT id, username, role, first_name, last_name, email, phone, status, created_at, updated_at 
    FROM users 
    WHERE id = $1 AND role = 'cashier'
  `, [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Cashier not found' });
    return;
  }

  res.json(result.rows[0]);
});

export const createCashier = asyncHandler(async (req: Request, res: Response) => {
  const { username, password, first_name, last_name, email, phone, status } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const role = 'cashier';

  const result = await pool.query(
    `INSERT INTO users (username, password, role, first_name, last_name, email, phone, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     RETURNING id, username, role, first_name, last_name, email, phone, status`,
    [username, hashedPassword, role, first_name, last_name, email, phone, status]
  );

  res.status(201).json(result.rows[0]);
});

export const updateCashier = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { username, password, first_name, last_name, email, phone, status } = req.body;

  const existing = await pool.query(`SELECT * FROM users WHERE id = $1 AND role = 'cashier'`, [id]);
  if (existing.rowCount === 0) {
    res.status(404).json({ message: 'Cashier not found' });
    return;
  }

  let hashedPassword = existing.rows[0].password;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const result = await pool.query(
    `UPDATE users SET 
      username = $1,
      password = $2,
      first_name = $3,
      last_name = $4,
      email = $5,
      phone = $6,
      status = $7,
      updated_at = NOW()
     WHERE id = $8 AND role = 'cashier'
     RETURNING id, username, role, first_name, last_name, email, phone, status`,
    [username, hashedPassword, first_name, last_name, email, phone, status, id]
  );

  res.json(result.rows[0]);
});

export const deleteCashier = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await pool.query(`DELETE FROM users WHERE id = $1 AND role = 'cashier'`, [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Cashier not found or cannot delete non-cashier user' });
    return;
  }

  res.json({ message: 'Cashier deleted successfully' });
});
