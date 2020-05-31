import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, first } from 'rxjs/operators';

import { UserService } from '@core/services/user/user.service';
import { IUser } from '@core/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private loading: boolean;
  userExists: boolean;
  user: IUser;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this._loadUser();
  }

  private _loadUser(): any {
    this.loading = true;
    this.userExists = false;
    this.userService.fetchUserData().pipe(
      first(),
      catchError((err) => {
        return of({...err, error: true});
      }),
      finalize(() => this.loading = false)
    ).subscribe(data => {
      if (data.error) {
        if (data.status === 401) {
          console.log(data);
          this.router.navigate(['login/setup']);
        }
        console.error(data);
      }
      // user exists. display information and fetch posts;
      this.userExists = true;
      this.user = data;
      console.log(this.user);
    });
  }

}
