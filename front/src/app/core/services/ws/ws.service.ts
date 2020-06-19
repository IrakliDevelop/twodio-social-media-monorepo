import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '@core/services/auth/auth.service'; // use long import to avoid circular dependency

import { environment } from '../../../../environments/environment';
import { filter, first, map } from 'rxjs/operators';
import { PostsService } from '../posts/posts.service';

interface WsEvents {
  'post-add': (data: any) => void;
  'post-edit': (data: any) => void;
  'post-like': (data: any) => void;
  'post-unlike': (data: any) => void;
}

@Injectable({
  providedIn: 'root',
})
export class WsService {
  private ws?: WebSocket;
  connected$ = new BehaviorSubject<boolean>(false);
  rawEvent$ = new Subject<any>();
  event$ = this.rawEvent$.pipe(
    map(evt => ({
      event: evt.event,
      data: !evt.data ? {} : {
        ...evt.data,
        comment: !evt.data.comment ? undefined :
          this.postsService.parsePost(evt.data.comment),
        post: !evt.data.post ? undefined :
          this.postsService.parsePost(evt.data.post),
        posts: !evt.data.posts ? undefined :
          evt.data.posts.map(x => this.postsService.parsePost(x)),
      },
    }))
  );

  constructor(
    private cookieService: CookieService,
    private authService: AuthService,
    private postsService: PostsService
  ) {
    this.authService.authToken$.subscribe((token?: string) => {
      if (token) { return this.initWs(token); }

      if (this.ws) { this.ws.close(); }
      this.ws = undefined;
      this.setConnected(false);
    });
  }

  private setConnected(flag = true) {
    this.connected$.next(flag);
    this.rawEvent$.next({ event: flag ? 'connect' : 'disconnect' });
  }

  private initWs(token: string) {
    this.cookieService.set('id-token', token, new Date().setMinutes(1));
    this.ws = new WebSocket(environment.wsUrl);

    this.ws.addEventListener('message', x => this.rawEvent$.next(JSON.parse(x.data)));
    this.ws.addEventListener('close', x => this.setConnected(false));

    this.setConnected(true);
  }

  on$<T extends keyof WsEvents>(...events: T[]) {
    const eventSet = new Set(events);
    return this.event$
      .pipe(filter(x => eventSet.has(x.event)));
  }

  once$<T extends keyof WsEvents>(...events: T[]) {
    const eventSet = new Set(events);
    return this.event$
      .pipe(
        filter(x => eventSet.has(x.event)),
        first()
      );
  }

  on<T extends keyof WsEvents>(event: T, handler: WsEvents[T]) {
    return this.on$(event)
      .subscribe(x => handler(x.data));
  }

  once<T extends keyof WsEvents>(event: T, handler: WsEvents[T]) {
    return this.once$(event)
      .subscribe(handler);
  }
}
