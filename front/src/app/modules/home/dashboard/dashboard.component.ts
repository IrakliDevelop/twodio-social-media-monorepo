import { Component, OnInit } from '@angular/core';
import { UserService } from '@core/services/user/user.service';
import { finalize, first } from 'rxjs/operators';

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
      finalize(() => this.loading = false)
    ).subscribe(data => console.log(data));
  }

}
