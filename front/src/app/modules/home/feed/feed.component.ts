import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {finalize, takeUntil} from 'rxjs/operators';
import * as moment from 'moment';
import {PostsService, WsService} from '@core/services';
import {IPost} from '@core/models';
import {Subject} from 'rxjs';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
  limit = 20;
  offset = 0;
  after: string;

  noPosts = false;
  posts: IPost[];
  post: IPost;
  postForm: FormGroup;

  unsubscribe$: Subject<void>;
  singlePostLoading: boolean;
  allPostsLoading: boolean;

  constructor(
    private wsService: WsService,
    private postsService: PostsService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.wsService.event$.subscribe(({event, data}) => {
      console.log({event, data});
    });
    this.unsubscribe$ = new Subject<void>();
    this.posts = [];
    this.postForm = this.fb.group({
      text: new FormControl('', [Validators.required]),
    });
    this.loadPosts(this.limit, this.offset);
  }

  loadPosts(limit: number, offset: number, after?: string) {
    this.allPostsLoading = true;
    this.postsService.getFeed(limit, offset, after).pipe(
      takeUntil(this.unsubscribe$),
      finalize(() => this.allPostsLoading = false)
    ).subscribe((res) => {
      console.log(res);
      this.noPosts = !res.posts;
      // tslint:disable-next-line:variable-name
      this.posts = res.posts && res.posts.map(post => {
        post.created = moment(post.created).fromNow();
        return post;
      });
    });
  }

  addNewPost(): any {
    if (this.postForm.invalid) {
      return;
    }
    this.post = this.postForm.value;
    console.log(this.post);
    this.singlePostLoading = true;
    this.postsService.createPost(this.post)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(
          () => this.singlePostLoading = false
          )
      ).subscribe(res => {
        this.postForm.reset();
        if (res.text && res.text === this.post.text) { // TODO: this is temporarily. use proper success checking
          this.loadPosts(this.limit, this.offset);
        }
    });
  }

}
