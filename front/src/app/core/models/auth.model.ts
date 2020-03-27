import {Observable} from 'rxjs';
import {CognitoUser} from '@aws-amplify/auth';
import {AmplifyService} from 'aws-amplify-angular';

export interface IAuth {
  username?: string;
  password?: string;
}

export abstract class AuthData {
  protected constructor(amplifyService: AmplifyService) {
  }
  abstract isAuthenticated(): boolean;
  abstract signIn(email: string, password: string): Observable<CognitoUser>;
  abstract signUp(email: string, password: string): Observable<any>;
  abstract signOut(): Observable<any>;
}
