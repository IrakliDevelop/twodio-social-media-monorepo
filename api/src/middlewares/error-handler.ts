import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from 'express-jwt';
import { SignupRequiredError } from '../errors/signupRequiredError';

export default function() {
  return (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error(err);
    const sendErr = (
      status: number,
      code: string,
      message: string = code
    ) => res.status(status).send({ ok: false, code, message });

    if (
      err instanceof UnauthorizedError ||
      err instanceof SignupRequiredError
    ) {
      return sendErr(401, err.code, err.message);
    }
    return sendErr(500, 'internal_server_error');
  }
}
