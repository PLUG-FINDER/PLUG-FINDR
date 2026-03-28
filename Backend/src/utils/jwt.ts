import jwt from "jsonwebtoken";

export type UserRole = "STUDENT" | "VENDOR" | "ADMIN";

export interface JwtPayload {
  id: string;
  role: UserRole;
}

const JWT_SECRET: string = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};



