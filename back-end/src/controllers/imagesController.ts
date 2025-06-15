import { Request, Response } from 'express';
import { pool } from '../config/db';

// GET: ดึงข้อมูล images ทั้งหมด
export const getImages = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM images');
        res.json(result.rows);  // ส่งกลับข้อมูล images ทั้งหมด
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET: ดึงข้อมูล image ตาม ID
export const getImageById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM images WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        console.error('Error fetching image by id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST: เพิ่ม image ใหม่
export const createImage = async (req: Request, res: Response) => {
    const { menu_id, image_url } = req.body;
    const created_at = new Date();
    const updated_at = new Date();

    try {
        const result = await pool.query(
            `INSERT INTO images (menu_id, image_url, created_at, updated_at)
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [menu_id, image_url, created_at, updated_at]
        );
        res.status(201).json(result.rows[0]);  // ส่งกลับข้อมูลที่เพิ่มใหม่
    } catch (error) {
        console.error('Error creating image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PATCH: อัปเดตข้อมูล image
export const updateImage = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { menu_id, image_url } = req.body;
    const updated_at = new Date();

    try {
        const result = await pool.query(
            `UPDATE images SET menu_id = $1, image_url = $2, updated_at = $3
            WHERE id = $4 RETURNING *`,
            [menu_id, image_url, updated_at, id]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE: ลบ image
export const deleteImage = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM images WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length > 0) {
            res.json({ message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
