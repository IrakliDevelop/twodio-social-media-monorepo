import { Component, OnInit } from '@angular/core';
import {PostsService} from '@core/services';
import {IPost} from '@core/models';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
  limit = 20;
  offset = 0;
  after: string;
  posts: IPost[];

  constructor(
    private postsService: PostsService
  ) { }

  ngOnInit() {
    this.posts = [];
    this.loadPosts(this.limit, this.offset);
  }
  loadPosts(limit: number, offset: number, after?: string) {
    this.postsService.getPosts(limit, offset, after).subscribe(res => {
      console.log(res);
      this.posts = res;
    });
  }

}
