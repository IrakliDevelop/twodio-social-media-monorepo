import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { AmplifyService } from 'aws-amplify-angular';
import Amplify from '@aws-amplify/core';
import { AuthState } from 'aws-amplify-angular/src/providers/auth.state';
import Auth, { CognitoUser } from '@aws-amplify/auth';
import * as R from 'ramda';

import { environment } from '../../../../environments/environment';
import {AuthData} from '../../models';

Amplify.configure(environment.amplify);


const SESSION_INITIAL: AuthState = {
  state: 'signedOut',
  user: null,
};

@Injectable()
export class AuthService extends AuthData {
  currentSession$: BehaviorSubject<AuthState> = new BehaviorSubject(SESSION_INITIAL);
  authToken$ = this.currentSession$.pipe(pluck('user', 'signInUserSession', 'idToken', 'jwtToken'));
  constructor(private amplifyService: AmplifyService) {
    super();
  }

  async init(): Promise<any> {
    this.amplifyService.authState().subscribe(e => this.currentSession$.next(e));
    try {
      await Auth.currentSession();
    } catch (err) {
      console.warn(err);
    }
    return Promise.resolve(null);
  }

  signIn(email, password): Observable<CognitoUser> {
    return from(Auth.signIn(email.toLowerCase(), password));
  }

  signOut(): Observable<any> {
    return from(Auth.signOut());
  }

  signUp(email, password): Observable<any> {
    console.log(email, password);
    return from(Auth.signUp({
      username: email.toLowerCase(),
      password,
    }));
  }

  confirmSignUp(email: string, code: string): Observable<any> {
    return from(Auth.confirmSignUp(email.toLowerCase(), code));
  }

  resendSignUp(email: string): Observable<any> {
    return from(Auth.resendSignUp(email.toLowerCase()));
  }

  changePassword(oldPassword: string, newPassword: string): Promise<any> {
    return Auth.currentAuthenticatedUser()
      .then(user => {
        return Auth.changePassword(user, oldPassword, newPassword);
      });
  }

  forgetPassword(email: string): Promise<any> {
    return Auth.forgotPassword(email.toLowerCase());
  }

  forgotPasswordSubmit(email, code, newPassword): Promise<any> {
    return Auth.forgotPasswordSubmit(email.toLowerCase(), code, newPassword);
  }

  getAuthorizationToken(): string {
    if (!this.isAuthenticated()) {
      return '';
    }
    return this.currentSession$.getValue().user.signInUserSession.idToken.jwtToken;
  }

  isAuthenticated(): boolean {
    return this.currentSession$.getValue().state === 'signedIn';
  }

  getCurrentSessionIdTokenPayload(): { [key: string]: any } {
    const { user } = this.currentSession$.getValue();
    return R.path(['signInUserSession', 'idToken', 'payload'], user) || {};
  }

  getUserEmail() {
    return this.getCurrentSessionIdTokenPayload().email;
  }

  async refreshSessionPromise(): Promise<any> {
    const session = await Auth.currentSession();
    const refreshToken = session.getRefreshToken();
    const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
    return new Promise((resolve, rej) => {
      user.refreshSession(refreshToken, (err) => {
        if (err) {
          rej(err);
          return;
        }
        this.amplifyService.setAuthState({ state: 'signedIn', user });
        resolve();
      });
    });
  }
}

export function AuthServiceFactory(provider: AuthService) {
  return () => provider.init();
}
