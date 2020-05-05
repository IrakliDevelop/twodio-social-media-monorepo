import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import * as R from 'ramda';
import { AuthService } from '../auth/auth.service';

import { environment } from '../../../../environments/environment';
import { filter, first } from 'rxjs/operators';

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
  event$ = new Subject<any>();

  constructor(
    private cookieService: CookieService,
    private authService: AuthService,
  ) {
    this.authService.authToken$.subscribe((token?: string) => {
      if (token) return this.initWs(token);

      if (this.ws) this.ws.close();
      this.ws = undefined;
      this.setConnected(false);
    });
  }

  private setConnected(flag = true) {
    this.connected$.next(flag);
    this.event$.next({ event: flag ? 'connect' : 'disconnect' });
  }

  private initWs(token: string) {
    this.cookieService.set('id-token', token, new Date().setMinutes(1));
    this.ws = new WebSocket(environment.wsUrl);

    this.ws.addEventListener('message', x => this.event$.next(JSON.parse(x.data)));
    this.ws.addEventListener('close', x => this.setConnected(false));

    this.setConnected(true);
  }


  on<T extends keyof WsEvents>(event: T, handler: WsEvents[T]) {
    return this.event$
      .pipe(filter(x => x.event === event))
      .subscribe(x => handler(x.data));
  }

  once<T extends keyof WsEvents>(event: T, handler: WsEvents[T]) {
    return this.event$
      .pipe(
        filter(x => x.event === event),
        first()
      )
      .subscribe(handler);
  }
}
