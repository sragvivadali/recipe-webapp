
import { User } from '../../src/generated/prisma'; // adjust path as needed

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};