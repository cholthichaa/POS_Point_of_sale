import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; role: string };  // Define the structure of user info attached to the request
    }
  }
}
