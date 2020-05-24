import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {UserService} from '@core/services';
import {IUser} from '@core/models';
import {UserInfoModalComponent} from '@shared/components';

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
  users?: IUser[];
  usersIdSet: Set<string> = new Set();

  constructor(
    private userService: UserService,
    private modalService: NgbModal
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
      this.users = [...res.byUsername, ...res.byFullName];
      this.users.forEach(user => this.usersIdSet.add(user.id));
      // filter non-unique values
      this.users = this.users.filter(user => {
        if (this.usersIdSet.has(user.id)) {
          this.usersIdSet.delete(user.id);
          return true;
        }
        return false;
      });
    });
  }

  followUser(username?: string): void {
    if (!username) { return; }
    this.userService.followUser(username).pipe(
      takeUntil(this.unsubscribe$),
      finalize(() => this.loading = false)
    ).subscribe(res => console.log(res));
  }

  getUserDetails(user?: IUser): void {
    const modal = this.modalService.open(UserInfoModalComponent, {size: 'lg', backdrop: 'static', keyboard: false});
    modal.componentInstance.user = user;
    modal.result.then(result => console.log(result)
      , reason => console.log(reason));
  }

}
