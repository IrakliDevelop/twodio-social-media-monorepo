import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from 'express-jwt';

export default function() {
  return (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const sendErr = (
      status: number,
      code: string,
      message: string = code
    ) => res.status(status).send({ ok: false, code, message });

    if (err instanceof UnauthorizedError) {
      return sendErr(401, err.code, err.message);
    }
    return sendErr(500, 'internal_server_error');
  }
}
