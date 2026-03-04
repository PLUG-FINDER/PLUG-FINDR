import { NextFunction, Request, Response } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: JwtPayload["role"];
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Not authorized, no token" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401).json({ message: "User not found or inactive" });
      return;
    }

    req.user = { id: user._id.toString(), role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};



