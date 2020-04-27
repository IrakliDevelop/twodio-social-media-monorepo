import { Component, OnInit } from '@angular/core';
import { UserService } from '@core/services/user/user.service';
import { catchError, finalize, first } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private loading: boolean;

  constructor(
    private userService: UserService
  ) {
  }

  ngOnInit() {
    this._loadUser();
  }

  private _loadUser(): any {
    this.loading = true;
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
          // todo: redirect to setup
        }
      }
    });
  }

}
