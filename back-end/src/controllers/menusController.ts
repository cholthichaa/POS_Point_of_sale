import { Request, Response } from 'express';
import { pool } from '../config/db';

// GET: ดึงข้อมูลเมนูทั้งหมด
// GET: ดึงข้อมูลเมนูทั้งหมด พร้อมชื่อหมวดหมู่
export const getMenus = async (req: Request, res: Response) => {
    try {
        // ใช้ SQL JOIN เพื่อดึงข้อมูลเมนูพร้อมกับชื่อหมวดหมู่
        const result = await pool.query(`
            SELECT menus.*, categories.name AS category_name
            FROM menus
            JOIN categories ON menus.category_id = categories.id
        `);
        res.json(result.rows);  // ส่งกลับข้อมูลเมนูทั้งหมดพร้อมชื่อหมวดหมู่
    } catch (error) {
        console.error('Error fetching menus:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// GET: ดึงข้อมูลเมนูตาม ID
export const getMenuById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM menus WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Menu not found' });
        }
    } catch (error) {
        console.error('Error fetching menu by id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST: เพิ่มเมนูใหม่
export const createMenu = async (req: Request, res: Response) => {
    const { category_id, image_url, name, description, price, status } = req.body;
    const created_at = new Date();
    const updated_at = new Date();

    try {
        const result = await pool.query(
            `INSERT INTO menus (category_id, image_url, name, description, price, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [category_id, image_url, name, description, price, status, created_at, updated_at]
        );
        res.status(201).json(result.rows[0]);  // ส่งกลับข้อมูลที่เพิ่มใหม่
    } catch (error) {
        console.error('Error creating menu:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const updateMenu = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;  // ดึงข้อมูล status จาก body

    try {
        const result = await pool.query(
            `UPDATE menus SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);  // ส่งกลับข้อมูลที่อัปเดต
        } else {
            res.status(404).json({ message: 'Menu not found' });
        }
    } catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



// DELETE: ลบเมนู
export const deleteMenu = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM menus WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length > 0) {
            res.json({ message: 'Menu deleted successfully' });
        } else {
            res.status(404).json({ message: 'Menu not found' });
        }
    } catch (error) {
        console.error('Error deleting menu:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
