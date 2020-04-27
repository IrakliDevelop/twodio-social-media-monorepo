import {
  User,
  AuthData,
  AuthProvider
} from './generated';

export interface AuthenticatedUser extends Pick<User, 'id' | 'email'> {
  authData: Pick<AuthData, 'id'> & {
    provider: Pick<AuthProvider, 'id'> & {
    };
  };
}
