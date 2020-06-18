import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import * as moment from 'moment';
import {IPost} from '@core/models';
import {map} from 'rxjs/operators';

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

  parsePost(post: IPost) {
    return {
      ...post,
      iLike: post.iLike || false,
      likeCount: post.likeCount || 0,
      childrenCount: post.childrenCount || 0,
      comm: post.likeCount || 0,
      created: new Date(post.created),
      updated: new Date(post.updated),
      createdFromNow: moment(post.created).fromNow(),
    };
  }

  getFeed(first?: number, offset?: number, after?: string): Observable<IPost[]> {
    return this.http.get<any>(`${this.URL}/api/feed`, {
      params: {
        first: first.toString(),
        offset: offset.toString(),
        after: after ? after : '',
      },
    }).pipe(map(posts => posts.map(x => this.parsePost(x))));
  }

  getMyPosts(first?: number, offset?: number, after?: string): Observable<IPost[]> {
    return this.http.get<any>(`${this.URL}/api/posts`, {
      params: {
        first: first.toString(),
        offset: offset.toString(),
        after: after ? after : '',
      },
    }).pipe(map(posts => posts.map(x => this.parsePost(x))));
  }

  getComments(postID: string, args: Args = {}): Observable<IPost[]> {
    return this.http.get<any>(`${this.URL}/api/posts/${postID}/comments`, {
      params: eachArgToString(args),
    }).pipe(map(posts => posts.map(x => this.parsePost(x))));
  }

  createPost(post: any): Observable<any> {
    return this.http.post(`${this.URL}/api/posts`, post);
  }

  addComment(postID: string, comment: any): Observable<any> {
    return this.http.post(`${this.URL}/api/posts/${postID}/comment`, {text: comment});
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
