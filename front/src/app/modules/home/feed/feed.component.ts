import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {finalize, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import * as moment from 'moment';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {PostsService, WsService} from '@core/services';
import {IPost} from '@core/models';
import {PostDetailsModalComponent} from '@shared/components';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
  limit = 50;
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
    private fb: FormBuilder,
    private modalService: NgbModal
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
      this.noPosts = !res;
      // tslint:disable-next-line:variable-name
      this.posts = res.map(post => {
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
  openPostDetails(post: IPost) {
    const modal = this.modalService.open(PostDetailsModalComponent, {size: 'lg', keyboard: false});
    modal.componentInstance.post = post;
  }

  onLike(postID: string): void {
    this.postsService.likePost(postID).subscribe(res => {
      console.log(res);
      if (res.ok) { this.posts.find(post => post.id === postID).likeCount++; }
    });
  }
  onUnlike(postID: string): void {
    this.postsService.unlikePost(postID).subscribe(res => {
      console.log(res);
      if (res.ok) { this.posts.find(post => post.id === postID).likeCount--; }
    });
  }

}
