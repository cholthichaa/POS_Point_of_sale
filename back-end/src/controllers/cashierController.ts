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

// สร้างแคชเชียร์ใหม่ พร้อม log
export const createCashier = asyncHandler(async (req: Request, res: Response) => {
  const { username, password, first_name, last_name, email, phone, status } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const role = 'cashier';

  const result = await pool.query(`
    INSERT INTO users (username, password, role, first_name, last_name, email, phone, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING id, username, role, first_name, last_name, email, phone, status
  `, [username, hashedPassword, role, first_name, last_name, email, phone, status]);

  console.log(`[LOG] Created cashier: ${result.rows[0].username} (ID: ${result.rows[0].id})`);

  res.status(201).json(result.rows[0]);
});

export const patchUpdateCashier = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { status } = req.body;  

  // Ensure valid status value (active or inactive)
  if (status !== 'active' && status !== 'inactive') {
    return res.status(400).json({ message: 'Invalid status value. Please provide either "active" or "inactive"' });
  }
  
  const existing = await pool.query(`SELECT * FROM users WHERE id = $1 AND role = 'cashier'`, [id]);
  if (existing.rowCount === 0) {
    return res.status(404).json({ message: 'Cashier not found' });
  }

  const result = await pool.query(`
    UPDATE users
    SET status = $1, updated_at = NOW()
    WHERE id = $2 AND role = 'cashier'
    RETURNING id, username, role, first_name, last_name, email, phone, status
  `, [status, id]);

  console.log(`[LOG] Updated cashier status ID ${id}: ${status}`);

  res.json(result.rows[0]);  // Return the updated user with the new status
});



// ลบแคชเชียร์ พร้อม log
export const deleteCashier = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await pool.query(`DELETE FROM users WHERE id = $1 AND role = 'cashier'`, [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Cashier not found or cannot delete non-cashier user' });
    return;
  }

  console.log(`[LOG] Deleted cashier ID ${id}`);

  res.json({ message: 'Cashier deleted successfully' });
});


