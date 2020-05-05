import { Request, Response, NextFunction } from 'express';
import { compose } from 'compose-middleware';
import jwt from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import config from '../config';
import { AuthenticatedUser, CognitoUser } from '../types';
import { container } from 'tsyringe';
import { UserModel, userProjections } from '../models';
import { SignupRequiredError } from '../errors/signupRequiredError';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      cognitoUser?: CognitoUser;
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
    userProperty: 'cognitoUser',
    getToken: req => {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
          return req.headers.authorization.split(' ')[1];
      }
      // only use jwt token from cookie for websocket upgrade
      else if ((req as any).upgrade && req.cookies['id-token']) {
        return req.cookies['id-token'];
      }
      return null;
    },
    ...expressJwtOptions,
  });
}

export function authenticator(attachUser = true) {
  const cognitoAuth = cognitoAuthenticator(
    config.auth.cognito.poolId,
    config.auth.cognito.jwtOptions
  );

  if (!attachUser) {
    return cognitoAuth;
  }

  return compose(
    cognitoAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.user = await container.resolve(UserModel)
          .fetchByAuthSub(
            req.cognitoUser!.sub,
            userProjections.general
          ) as AuthenticatedUser;

        if (!req.user) {
          throw new SignupRequiredError();
        }
        next();
      } catch (err) {
        next(err);
      }
    }
  );
}
