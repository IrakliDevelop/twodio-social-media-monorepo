import { Request, Response } from 'express';
import jwt from 'express-jwt';
import { compose } from 'compose-middleware';
import { expressJwtSecret } from 'jwks-rsa';
import { container } from 'tsyringe';
import config from '../config';
import * as types from '../types';
import User from '../models/user';

declare global {
  namespace Express {
    interface Request {
      user?: types.CognitoUser;
    }
  }
}

async function createCognitoUser(cognitoUser?: types.CognitoUser) {
  if (!cognitoUser) {
    throw new jwt.UnauthorizedError('credentials_required', { message: 'Unautorized' });
  }

  await container.resolve(User).create({
    email: cognitoUser.email,
    authData: {
      sub: cognitoUser.sub,
      provider: {
        name: 'cognito',
      },
    },
  });
}

export function cognitoAuthenticator(
  poolId: string,
  expressJwtOptions: Partial<jwt.Options> = {}
) {
  const region = poolId.split('_')[0];
  if (!region) {
    throw Error('Invalid Pool Id');
  }

  const issuer = `https://cognito-idp.${region}.amazonaws.com/${poolId}`;
  const jwtMiddleware = jwt({
    issuer,
    algorithms: ['RS256'],
    secret: expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksUri: `${issuer}/.well-known/jwks.json`,
    }),
    ...expressJwtOptions,
  });

  return compose(
    jwtMiddleware,
    (req: Request, res: Response, next: NextFunction) =>  {
      createCognitoUser(req.user);
      next();
    }
  );
}

export default () => cognitoAuthenticator(
  config.auth.cognito.poolId,
  config.auth.cognito.jwtOptions
);
