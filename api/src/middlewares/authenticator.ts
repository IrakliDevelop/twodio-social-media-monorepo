import { Request, Response, NextFunction } from 'express';
import jwt from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import config from '../config';
import * as types from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: types.CognitoUser;
    }
  }
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
  return jwt({
    issuer,
    algorithms: ['RS256'],
    secret: expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksUri: `${issuer}/.well-known/jwks.json`,
    }),
    ...expressJwtOptions,
  });
}

export const authenticator = () => cognitoAuthenticator(
  config.auth.cognito.poolId,
  config.auth.cognito.jwtOptions
);
