import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  const status = 500;
  const message = 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
  });
};
