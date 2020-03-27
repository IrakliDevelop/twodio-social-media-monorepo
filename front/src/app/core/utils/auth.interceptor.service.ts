import {Injectable} from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {first, tap} from 'rxjs/operators';
import {Router} from '@angular/router';

import {AuthService} from '../services';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private router: Router,
              private authService: AuthService) {

  }

  addAuthHeader(req: HttpRequest<any>): HttpRequest<any> {
    // for future s3 presigned url's we don't need to override header
    if (req.headers.get('Anonymous')) {
      return req;
    }

    // clone the request to add the new header
    return req.clone({setHeaders: {Authorization: `Bearer ${this.authService.getAuthorizationToken()}`}});
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.get('Anonymous')) {
      return next.handle(req);
    }
    // Clone the request to add the new header
    const clonedRequest = this.addAuthHeader(req);

    // Pass the cloned request instead of the original request to the next handle
    return next.handle(clonedRequest).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response if you want
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.statusText === 'Unknown Error') {
          console.error(err);
        }

        if (err.status === 401) {
          return this.reloadSession(clonedRequest, next);
        }

        return throwError;
      }
    }));
  }

  reloadSession(request: HttpRequest<any>, next: HttpHandler): Promise<any> {
    return this.authService.refreshSessionPromise()
      .then(() => {
        const requestWithAuthHeader = this.addAuthHeader(request);
        return next.handle(requestWithAuthHeader);
      }, () => {
        this.signOut();
        return;
      });
  }

  signOut(): void {
    this.authService.signOut().pipe(first()).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
