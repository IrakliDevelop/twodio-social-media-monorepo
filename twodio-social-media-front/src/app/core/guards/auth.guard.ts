import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from '../services';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router,
              private authService: AuthService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAuthenticated() && state.url === '/login') {
      this.router.navigate(['']);
      return false;
    } else if (!this.authService.isAuthenticated()) {
      if (state.url === '/login') {
        return true;
      } else {
        this.router.navigate(['login']);
        return false;
      }
    }

    return true;
  }

}
