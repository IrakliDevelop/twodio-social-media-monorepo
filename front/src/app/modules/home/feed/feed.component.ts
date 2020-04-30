import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {finalize, takeUntil} from 'rxjs/operators';
import {PostsService} from '@core/services';
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

  posts: IPost[];
  post: IPost;
  postForm: FormGroup;

  unsubscribe$: Subject<void>;
  postLoading: boolean;

  constructor(
    private postsService: PostsService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.unsubscribe$ = new Subject<void>();
    this.posts = [];
    this.postForm = this.fb.group({
      text: new FormControl('', [Validators.required]),
    });
    this.loadPosts(this.limit, this.offset);
  }

  loadPosts(limit: number, offset: number, after?: string) {
    this.postsService.getPosts(limit, offset, after).subscribe(res => {
      console.log(res);
      this.posts = res;
    });
  }

  addNewPost(): any {
    if (this.postForm.invalid) {
      return;
    }
    this.post = {text: this.postForm.value};
    console.log(this.post);
    this.postLoading = true;
    this.postsService.createPost(this.post)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(
          () => this.postLoading = false
          )
      ).subscribe(res => console.log(res));
  }

}
