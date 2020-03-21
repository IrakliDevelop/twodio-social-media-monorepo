import {Observable} from 'rxjs';

export interface IAuth {
  username?: string;
  password?: string;
}

export abstract class AuthData {
  abstract isAuthenticated(): boolean;
  abstract login(model: IAuth): Observable<any>;
  abstract signOut(): void;
  abstract getUserName(): string;
}
