// src/types/express.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Use 'any' or a more specific type for your user
    }
  }
}
