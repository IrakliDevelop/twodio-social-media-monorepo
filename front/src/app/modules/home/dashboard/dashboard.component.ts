import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';

import { UserService, PostsService } from '@core/services';
import { IUser, IPost } from '@core/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private loading: boolean;
  userExists: boolean;
  user: IUser;
  unsubscribe$: Subject<void>;
  posts: IPost[];
  limit = 20;
  offset = 0;
  after: string;

  constructor(
    private userService: UserService,
    private postsService: PostsService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.unsubscribe$ = new Subject<void>();
    this.posts = [];
    this._loadUser();
  }

  private _loadUser(): any {
    this.loading = true;
    this.userExists = false;
    this.userService.fetchUserData().pipe(
      takeUntil(this.unsubscribe$),
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
      this.fetchPosts(this.limit, this.offset, this.after);
    });
  }

  fetchPosts(limit?: number, offset?: number, after?: string): void {
    this.loading = true;
    this.postsService.getMyPosts(limit, offset, after).pipe(
      takeUntil(this.unsubscribe$),
      finalize(() => this.loading = false)
    ).subscribe( data => {
      this.posts = [...this.posts, ...data];
    });
  }

}
