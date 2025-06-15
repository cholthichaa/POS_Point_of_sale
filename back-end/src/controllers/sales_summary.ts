import { pool } from '../config/db';
import { Request, Response } from 'express';

export const getDashboardData = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM tables) AS total_tables,
                (SELECT COUNT(*) FROM bills) AS total_bills,
                (SELECT COUNT(*) FROM orders) AS total_orders,
                (SELECT COUNT(*) FROM menus) AS total_menus,
                (SELECT COUNT(*) FROM categories) AS total_categories,
                (SELECT COUNT(*) FROM users) AS total_users,
                (SELECT SUM(total_amount) FROM bills) AS total_sales -- Sum of total_amount
        `);

        // ส่งข้อมูลกลับไปยัง Front-end
        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    } finally {
        client.release();
    }
};

