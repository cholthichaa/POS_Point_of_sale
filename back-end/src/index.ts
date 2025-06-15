import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db';  // import pool from config/db.ts
import './models/initDB';
import authRoutes from './routes/auth';
import cashierRoutes from './routes/cashierRoutes';
import categoryRoutes from './routes/categoryRoutes';
import zonesRoutes from './routes/zonesRoutes'; 
import tableRoutes from './routes/tableRoutes';
import menusRoutes from './routes/menusRoutes';
import ordersRoutes from './routes/ordersRoutes';
import orderItemsRoutes from './routes/orderItemsRoutes';
import billsRoutes from './routes/billsRoutes';
import { authMiddleware } from './middleware/authMiddleware';
import imagesRoutes from './routes/imagesRoutes';
import { getDashboardData } from './controllers/sales_summary';

dotenv.config();

const app = express();

// Middleware setup for JSON and URL-encoded data
app.use(express.json());  // For parsing JSON bodies
app.use(express.urlencoded({ extended: true }));  // For parsing form data

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

// Enable CORS for the frontend application
app.use(cors({
  origin: 'http://localhost:3000',
}));

// Database connection test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ serverTime: result.rows[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to Backend Server!');
});

// Register routes with authentication middleware where necessary
app.use('/api/auth', authRoutes); 
app.use('/api/cashiers', authMiddleware, cashierRoutes);  
app.use('/api/categories', categoryRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/table', tableRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api/order', ordersRoutes);
app.use('/api/order_items', orderItemsRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/dashboard', getDashboardData);

// Error handling middleware (last middleware in the stack)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error Handler:', err);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
