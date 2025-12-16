// Type augmentation for Express to add a custom user type to req.user
import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
      [key: string]: any;
    }
  }
}
