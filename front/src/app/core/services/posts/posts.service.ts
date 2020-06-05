import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {IPostResponse} from '@core/models';

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
export class PostsService {
  URL: string = environment.ApiUrl;

  constructor(
    private http: HttpClient
  ) {
  }

  getFeed(first?: number, offset?: number, after?: string): Observable<IPostResponse> {
    return this.http.get<any>(`${this.URL}/api/feed`, {
      params: {
        first: first.toString(),
        offset: offset.toString(),
        after: after ? after : '',
      },
    });
  }

  getMyPosts(first?: number, offset?: number, after?: string): Observable<any> {
    return this.http.get<any>(`${this.URL}/api/posts`, {
      params: {
        first: first.toString(),
        offset: offset.toString(),
        after: after ? after : '',
      },
    });
  }

  getComments(postID: string, args: Args = {}): Observable<any> {
    return this.http.get<any>(`${this.URL}/api/posts/${postID}/comments`, {
      params: eachArgToString(args),
    });
  }

  createPost(post: any): Observable<any> {
    return this.http.post(`${this.URL}/api/posts`, post);
  }

  addComment(postID: string, comment: any): Observable<any> {
    return this.http.post(`${this.URL}/api/posts/${postID}/comment`, comment);
  }

  setLike(postID: string, flag: boolean): Observable<any> {
    return this.http.put(`${this.URL}/api/posts/${postID}/${flag ? 'like' : 'unlike'}`, {});
  }

  likePost(postID: string): Observable<any> {
    return this.setLike(postID, true);
  }
  unlikePost(postID: string): Observable<any> {
    return this.setLike(postID, false);
  }
}
