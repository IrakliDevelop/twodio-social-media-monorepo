import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { IUser } from '@core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly URL: string = environment.ApiUrl;

  constructor(
    private http: HttpClient
  ) { }

  // TODO: maybe rename it?
  fetchUserData(): Observable<any> {
    return this.http.get<any>(`${this.URL}/api/me`);
  }

  finishRegistration(user: IUser): Observable<any> {
    return this.http.post<any>(`${this.URL}/api/auth/signup`, {user});
  }
}
