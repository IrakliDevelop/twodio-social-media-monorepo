import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';

interface Args {
  first?: number;
  offset?: number;
  after?: string;
}

function eachArgToString(args: Args) {
  return Object.entries(args)
    .reduce((r, [k, x]) => { r[k] = x.toString(); return r; }, {});
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  URL: string = environment.ApiUrl;

  constructor(
    private http: HttpClient
  ) {
  }

  getMyChats(args: Args = {}): Observable<any> {
    return this.http.get<any>(`${this.URL}/api/chat/list`, {
      params: eachArgToString(args),
    });
  }

  getChat(userID: string, args: Args = {}): Observable<any> {
    return this.http.get<any>(`${this.URL}/api/chat/${userID}`, {
      params: eachArgToString(args),
    });
  }

  sendMessage(userID: string, message: string): Observable<any> {
    return this.http.post(`${this.URL}/api/chat/${userID}`, { message });
  }
}
