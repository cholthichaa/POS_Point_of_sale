import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'MySuperSecretKey12345';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  const client = await pool.connect();
  try {
    // Query to get user data
    const userResult = await client.query('SELECT * FROM users WHERE username = $1', [username]);

    if (userResult.rows.length === 0) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const user = userResult.rows[0];

    // Check if the user status is 'inactive'
    if (user.status === 'inactive') {
      res.status(403).json({ message: 'Account is deactivated. You cannot log in.' });
      return;
    }

    // Compare password with the stored hashed password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' } // Set token expiration time
    );

    res.json({ token }); // Return token
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    client.release();
  }
};
