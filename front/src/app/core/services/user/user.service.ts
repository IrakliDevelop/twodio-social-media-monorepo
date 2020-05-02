import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {IUser, IUserSearchResponse} from '@core/models/user.model';

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
    return this.http.post<any>(`${this.URL}/api/auth/signup`, {...user});
  }
  searchUser(username?: string): Observable<IUserSearchResponse> {
    return this.http.get<IUserSearchResponse>(`${this.URL}/api/user/search/${username}`);
  }
  followUser(username?: string): Observable<any> {
    return this.http.post<any>(`${this.URL}/api/user/${username}/follow`, {});
  }
}
