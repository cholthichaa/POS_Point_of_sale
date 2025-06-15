import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { pool } from '../config/db';

// กำหนดประเภทข้อมูล
interface BillItem {
  menu_id: number;
  menu_name: string;
  quantity: number;
  price: number;
}

interface Bill {
  bill_id: number;
  order_id: number;
  total_amount: number;
  payment_status: string;
  payment_time: string;
  order_status: string;
  order_time: string;
  table_id: number;
  user_id: number;
  items: BillItem[];
}


// ใน API billService.ts ของคุณ (หลังบ้าน)
export const getBills = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT 
      b.id AS bill_id,
      b.order_id,
      b.total_amount,
      b.payment_status,
      b.payment_time,
      o.status AS order_status,
      o.order_time,
      o.table_id,
      o.user_id,
      oi.menu_id,
      m.name AS menu_name,
      oi.quantity,
      oi.price
    FROM bills b
    JOIN orders o ON b.order_id = o.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN menus m ON oi.menu_id = m.id
    ORDER BY b.id
  `);

  if (result.rowCount === 0) {
    res.status(404).json({ message: 'No bills found' });
    return;
  }

  // จัดกลุ่มข้อมูลเป็นโครงสร้างที่ต้องการ
  const bills = result.rows.reduce((acc: any[], row) => {
    let bill = acc.find(b => b.bill_id === row.bill_id);
    if (!bill) {
      bill = {
        bill_id: row.bill_id,
        order_id: row.order_id,
        total_amount: row.total_amount,
        payment_status: row.payment_status,
        payment_time: row.payment_time,
        order_status: row.order_status,
        order_time: row.order_time,
        table_id: row.table_id,
        user_id: row.user_id,
        items: [],
      };
      acc.push(bill);
    }
    bill.items.push({
      menu_id: row.menu_id,
      menu_name: row.menu_name,
      quantity: row.quantity,
      price: row.price,
    });
    return acc;
  }, []);

  res.json(bills); // ส่งข้อมูลบิลทั้งหมด
});


// ดึงบิลตาม id พร้อมข้อมูลคำสั่ง
export const getBillById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;  // ดึง id ของบิลจากพารามิเตอร์

  // ทำการดึงข้อมูลบิลและคำสั่ง (orders) พร้อมรายการสินค้า (order_items)
  const result = await pool.query(`
    SELECT 
      b.id AS bill_id, 
      b.order_id, 
      b.total_amount, 
      b.payment_status, 
      b.payment_time, 
      b.created_at, 
      b.updated_at,
      o.table_id,
      o.user_id,
      o.status AS order_status,
      o.order_time,
      oi.menu_id,
      m.name AS menu_name,
      oi.quantity,
      oi.price
    FROM bills b
    JOIN orders o ON b.order_id = o.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN menus m ON oi.menu_id = m.id
    WHERE b.id = $1
  `, [id]);

  // ตรวจสอบหากไม่พบข้อมูลบิล
  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Bill not found' });
    return;
  }

  // จัดกลุ่มข้อมูลให้เป็นโครงสร้างที่ต้องการ
  const billDetails: Bill[] = result.rows.reduce((acc: Bill[], row) => {
    let bill = acc.find(b => b.bill_id === row.bill_id);

    if (!bill) {
      bill = {
        bill_id: row.bill_id,
        order_id: row.order_id,
        total_amount: row.total_amount,
        payment_status: row.payment_status,
        payment_time: row.payment_time,
        order_status: row.order_status,
        order_time: row.order_time,
        table_id: row.table_id,
        user_id: row.user_id,
        items: []
      };
      acc.push(bill);
    }

    bill.items.push({
      menu_id: row.menu_id,
      menu_name: row.menu_name,
      quantity: row.quantity,
      price: row.price
    });

    return acc;
  }, []);

  res.json(billDetails);  // ส่งข้อมูลบิลและรายการสินค้า
});

// สร้างบิลใหม่
export const createBill = asyncHandler(async (req: Request, res: Response) => {
  const { order_id, total_amount, payment_status, payment_time } = req.body;

  // ตรวจสอบข้อมูลเบื้องต้น
  if (!order_id || total_amount == null || !payment_status) {
    res.status(400).json({ message: 'order_id, total_amount, and payment_status are required' });
    return;
  }

  // ตรวจสอบว่า order_id มีอยู่ในฐานข้อมูลจริงไหม
  const orderExists = await pool.query('SELECT id FROM orders WHERE id = $1', [order_id]);
  if (orderExists.rowCount === 0) {
    res.status(400).json({ message: 'Invalid order_id' });
    return;
  }

  const result = await pool.query(`
    INSERT INTO bills (order_id, total_amount, payment_status, payment_time, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, order_id, total_amount, payment_status, payment_time
  `, [order_id, total_amount, payment_status, payment_time || null]);

  res.status(201).json(result.rows[0]);
});

// อัพเดตบิล (PATCH)
export const updateBill = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const fieldsToUpdate = req.body;

  const existing = await pool.query('SELECT * FROM bills WHERE id = $1', [id]);
  if (existing.rowCount === 0) {
    res.status(404).json({ message: 'Bill not found' });
    return;
  }

  // สร้าง query dynamic update
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
    UPDATE bills SET
      ${setClauses.join(', ')},
      updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, order_id, total_amount, payment_status, payment_time
  `;

  const result = await pool.query(query, values);
  res.json(result.rows[0]);
});

// ลบบิล
export const deleteBill = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await pool.query('DELETE FROM bills WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Bill not found' });
    return;
  }

  res.json({ message: 'Bill deleted successfully' });
});
