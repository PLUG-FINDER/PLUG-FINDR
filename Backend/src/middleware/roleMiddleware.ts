import { NextFunction, Response } from "express";
import { AuthRequest } from "./authMiddleware";
import { UserRole } from "../utils/jwt";

export const requireRole = (roles: UserRole | UserRole[]) => {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!allowed.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: insufficient role" });
      return;
    }

    next();
  };
};



