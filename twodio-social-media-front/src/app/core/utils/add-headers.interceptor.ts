import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

import {AuthService} from '../services';

@Injectable()
export class AddHeadersInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.get('Anonymous')) {
      return next.handle(req);
    }
    // Clone the request to add the new header
    const clonedRequest = req.clone(
      {
        setHeaders: {Authorization: this.authService.getAccessToken()},
      });

    // Pass the cloned request instead of the original request to the next handle
    return next.handle(clonedRequest);
  }
}
