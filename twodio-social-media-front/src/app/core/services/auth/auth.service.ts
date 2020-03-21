import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as ACI from 'amazon-cognito-identity-js';

import { environment } from '../../../../environments/environment';
import {AuthData, IAuth} from '../../models';

type CognitoUserPoolWithStorage = ACI.CognitoUserPool & { storage: Storage };

const POOL_DATA = {
  UserPoolId: environment.cognitoUserPoolId,
  ClientId: environment.cognitoClientId,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService extends AuthData {
  private cognitoUser: ACI.CognitoUser;
  private session: ACI.CognitoUserSession;
  private user: any;
  private loading: boolean;

  constructor() {
    super();
    this.user = {
      username: 'unauthorized',
      attributes: {},
    };
    this._reloadSession();
  }

  isAuthenticated(): boolean {
    if (!this.loading && !!this.cognitoUser && !!this.session && !this.session.isValid()) {
      console.log('reload auth service');
      this.loading = true;
      this._reloadSession();
    }
    return !!this.cognitoUser && !!this.session && this.session.isValid();
  }

  getAccessToken(): string {
    return this.session ? this.session.getAccessToken().getJwtToken() : '';
  }

  notAuthorized(): void {
    console.log('not Authorized');
    this.session.isValid();
  }

  private _reloadSession(): void {
    this._createSession(this._getUserPool().getCurrentUser());
  }

  private _createSession(cognitoUser: ACI.CognitoUser): void {
    if (cognitoUser != null) {
      cognitoUser.getSession((err, session) => {
        this.loading = false;
        if (err) {
          this.cognitoUser = null;
          console.error(err);
          return;
        }
        this._initCognitoUserSession(cognitoUser, session);
      });
    }
  }

  signOut(): void {
    this.cognitoUser.signOut();
    this.cognitoUser = null;
  }

  getUserName(): string {
    return this.user.username;
  }

  login(model: IAuth): Observable<any> {
    const self = this;
    return Observable.create(observer => {
      const authData = {
        Username: model.username,
        Password: model.password,
      };

      const authDetails = new ACI.AuthenticationDetails(authData);


      const userData = {
        Username: model.username,
        Pool: this._getUserPool(),
      };

      const cognitoUser = new ACI.CognitoUser(userData);

      const callbacks = {
        onSuccess(session: ACI.CognitoUserSession): void {
          observer.next({
            user: cognitoUser,
          });
          observer.complete();
          self._initCognitoUserSession(cognitoUser, session);
        },
        onFailure: (err => {
          observer.error(err);
          observer.complete();
        }),
      };
      cognitoUser.authenticateUser(authDetails, callbacks);
    });
  }

  private _initCognitoUserSession(cognitoUser: ACI.CognitoUser, session: any): void {
    this.cognitoUser = cognitoUser;
    this.session = session;
    this.user.username = session.idToken.payload['cognito:username'];
    this.user.permissions = Number(session.idToken.payload['custom:permissions']);
    this.user.region = session.idToken.payload['custom:region'];
  }

  private _getUserPool(): CognitoUserPoolWithStorage {
    return new ACI.CognitoUserPool(POOL_DATA) as CognitoUserPoolWithStorage;
  }
}
