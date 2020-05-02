import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';
import {UserService} from '@core/services';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss'],
})
export class UserSearchComponent implements OnInit {
  unsubscribe$: Subject<void>;
  loading: boolean;
  userSearchControl: FormControl;
  userSearch: string;

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {
    this.unsubscribe$ = new Subject<void>();
    this.userSearchControl = new FormControl('', [Validators.required]);
    this._searchSubscribe();
  }
  private _searchSubscribe(): void {
    this.userSearchControl.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(data => this.userSearch = data);
  }

  searchUser(): void {
    if (this.userSearchControl.invalid) {
      return;
    }
    this.loading = true;
    this.userService.searchUser(this.userSearch).pipe(
      takeUntil(this.unsubscribe$),
      finalize(() => this.loading = false)
    ).subscribe(res => {
      console.log(res);
    });
  }

}
