import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { pool } from '../config/db';

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT o.id, o.table_id, o.user_id, o.status, o.order_time, o.created_at, o.updated_at, 
           oi.menu_id, oi.quantity, oi.price, m.name AS menu_name
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN menus m ON oi.menu_id = m.id
    ORDER BY o.id
  `);

  const orders = result.rows.reduce((acc: any[], row: any) => {
    // Check if order already exists in accumulator
    const order = acc.find((o) => o.id === row.id);
    if (order) {
      // Add order item to the existing order
      order.order_items.push({
        menu_id: row.menu_id,
        menu_name: row.menu_name,  // Add the menu name
        quantity: row.quantity,
        price: row.price,
      });
    } else {
      // Create a new order entry
      acc.push({
        id: row.id,
        table_id: row.table_id,
        user_id: row.user_id,
        status: row.status,
        order_time: row.order_time,
        created_at: row.created_at,
        updated_at: row.updated_at,
        order_items: [
          {
            menu_id: row.menu_id,
            menu_name: row.menu_name,  // Add the menu name
            quantity: row.quantity,
            price: row.price,
          },
        ],
      });
    }
    return acc;
  }, []);

  res.json(orders);
});


export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await pool.query(`
    SELECT o.id, o.table_id, o.user_id, o.status, o.order_time, o.created_at, o.updated_at, 
           oi.menu_id, oi.quantity, oi.price, m.name AS menu_name
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN menus m ON oi.menu_id = m.id
    WHERE o.id = $1
  `, [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  // Combine the orders and order items into one object
  const order = result.rows.reduce((acc: any, row: any) => {
    if (!acc) {
      acc = {
        id: row.id,
        table_id: row.table_id,
        user_id: row.user_id,
        status: row.status,
        order_time: row.order_time,
        created_at: row.created_at,
        updated_at: row.updated_at,
        order_items: [],
      };
    }

    // Add order items to the order
    acc.order_items.push({
      menu_id: row.menu_id,
      menu_name: row.menu_name,  // Add the menu name
      quantity: row.quantity,
      price: row.price,
    });

    return acc;
  }, null);

  res.json(order);
});



interface OrderItem {
  menu_id: number;
  quantity: number;
  price: number;
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();  // Connect to the database
  try {
    const { table_id, user_id, order_items }: {
      table_id: number;
      user_id: number;
      order_items: OrderItem[];
    } = req.body;

    // Start a transaction
    await client.query('BEGIN');

    // Create a new order with status "รอการชำระเงิน" and order_time set to NOW()
    const orderResult = await client.query(
      `INSERT INTO orders (table_id, user_id, status, order_time, created_at, updated_at)
       VALUES ($1, $2, 'รอการชำระเงิน', NOW(), NOW(), NOW()) RETURNING id`,
      [table_id, user_id]
    );
    const orderId = orderResult.rows[0].id;  // Get the created order's ID

    // Create order items for the newly created order
    const orderItemPromises = order_items.map((item: OrderItem) =>
      client.query(
        `INSERT INTO order_items (order_id, menu_id, quantity, price, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [orderId, item.menu_id, item.quantity, item.price]
      )
    );

    // Execute all the order items insertions
    await Promise.all(orderItemPromises);

    // Commit the transaction
    await client.query('COMMIT');

    // Send the response back to the client
    res.status(201).json({
      message: 'Order and order items created successfully',
      orderId: orderId
    });
  } catch (error: unknown) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);

    if (error instanceof Error) {
      res.status(500).json({
        message: 'Error creating order and order items',
        error: error.message
      });
    } else {
      res.status(500).json({
        message: 'Unknown error occurred',
      });
    }
  } finally {
    client.release();
  }
};


export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const fieldsToUpdate = req.body;

  // เช็คว่า order มีอยู่ในฐานข้อมูลหรือไม่
  const existing = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  if (existing.rowCount === 0) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  console.log("Updating order with ID:", id);
  console.log("Order data:", fieldsToUpdate);

  // ถ้าอัพเดต table_id หรือ user_id ให้ตรวจสอบความถูกต้อง
  if (fieldsToUpdate.table_id) {
    const tableExists = await pool.query('SELECT id FROM tables WHERE id = $1', [fieldsToUpdate.table_id]);
    if (tableExists.rowCount === 0) {
      res.status(400).json({ message: 'Invalid table_id' });
      return;
    }
  }
  if (fieldsToUpdate.user_id) {
    const userExists = await pool.query('SELECT id FROM users WHERE id = $1', [fieldsToUpdate.user_id]);
    if (userExists.rowCount === 0) {
      res.status(400).json({ message: 'Invalid user_id' });
      return;
    }
  }

  // สร้าง query dynamic update สำหรับ order
  const setClauses = [];
  const values: any[] = [];
  let idx = 1;
  for (const key in fieldsToUpdate) {
    if (key !== 'order_items') {
      setClauses.push(`${key} = $${idx}`);
      values.push(fieldsToUpdate[key]);
      idx++;
    }
  }
  values.push(id);

  const query = `
    UPDATE orders SET
      ${setClauses.join(', ')} ,
      updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, table_id, user_id, status, order_time
  `;

  const result = await pool.query(query, values);
  const updatedOrder = result.rows[0];

  // ถ้ามีการอัปเดต order_items
  if (fieldsToUpdate.order_items) {
    // ลบรายการเก่าของ order_id นี้
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);

    // เพิ่มรายการใหม่
    const orderItemPromises = fieldsToUpdate.order_items.map((item: OrderItem) =>
      pool.query(
        `INSERT INTO order_items (order_id, menu_id, quantity, price, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [id, item.menu_id, item.quantity, item.price]
      )
    );

    await Promise.all(orderItemPromises);
  }

  // ดึงข้อมูล order และ order_items หลังการอัปเดต
  const finalResult = await pool.query(`
    SELECT o.id, o.table_id, o.user_id, o.status, o.order_time, o.created_at, o.updated_at,
           oi.menu_id, oi.quantity, oi.price
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = $1
  `, [id]);

  const updatedOrderWithItems = finalResult.rows.reduce((acc: any, row: any) => {
    if (!acc) {
      acc = {
        id: row.id,
        table_id: row.table_id,
        user_id: row.user_id,
        status: row.status,
        order_time: row.order_time,
        created_at: row.created_at,
        updated_at: row.updated_at,
        order_items: [],
      };
    }

    acc.order_items.push({
      menu_id: row.menu_id,
      quantity: row.quantity,
      price: row.price,
    });

    return acc;
  }, null);

  res.json(updatedOrderWithItems);
});


export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  // เริ่มต้นการลบ order_items ที่เกี่ยวข้องกับ order นี้ก่อน
  await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);

  // จากนั้นลบ order
  const result = await pool.query('DELETE FROM orders WHERE id = $1', [id]);

  // ถ้าไม่พบ order ที่จะลบ
  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  // ลบสำเร็จ
  res.json({ message: 'Order and associated order items deleted successfully' });
});

