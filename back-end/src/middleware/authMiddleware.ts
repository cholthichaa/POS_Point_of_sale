import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'MySuperSecretKey12345';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];  // Extract token from header

  if (!token) {
    res.status(401).json({ message: 'No token provided, authorization denied' });
    return;  // End execution here after sending the response
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;  // Cast to 'any' or 'User' type
    req.user = decoded;  // Attach decoded user info to request
    next();  // Proceed to next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
