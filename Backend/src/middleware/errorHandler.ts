import { NextFunction, Request, Response } from "express";

// 404 handler
export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    message: `Not Found - ${req.originalUrl}`
  });
};

// Generic error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || "Server Error"
  });
};



