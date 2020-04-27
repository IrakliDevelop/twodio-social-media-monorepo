import { User, AuthData } from './generated'

export interface CognitoUser {
  sub: AuthData['sub'];
  email: User['email'];
}
