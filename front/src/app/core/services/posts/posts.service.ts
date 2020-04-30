import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  URL: string = environment.ApiUrl;

  constructor(
    private http: HttpClient
  ) {
  }

  getPosts(first?: number, offset?: number, after?: string): Observable<any> {
    return this.http.get<any>(`${this.URL}/api/posts`, {
      params: {
        first: first.toString(),
        offset: offset.toString(),
        after: after ? after : '',
      },
    });
  }
  createPost(post: any): Observable<any> {
    return this.http.post(`${this.URL}/api/posts`, post);
  }
}
