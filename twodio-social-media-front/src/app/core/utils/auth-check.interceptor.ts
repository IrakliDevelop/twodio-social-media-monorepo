import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest, HttpErrorResponse, HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthService } from '../services';

@Injectable()
export class AuthCheckInterceptor implements HttpInterceptor {
  constructor(private router: Router,
              private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .pipe(tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // do stuff with response if you want
        }
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.statusText === 'Unknown Error') {
            console.error(err);
            console.log('server error');
          }

          if (err.status === 401) {
            this.authService.notAuthorized();
          }
        }
      }));
  }
}
