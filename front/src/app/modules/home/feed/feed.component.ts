import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {takeUntil, map, switchMap, tap, scan, throttle, filter, debounceTime} from 'rxjs/operators';
import {Subject, BehaviorSubject, combineLatest, merge} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as R from 'ramda';

import {PostsService, WsService} from '@core/services';
import {mergePosts} from '@core/utils';
import {IPost} from '@core/models';
import {PostDetailsModalComponent} from '@shared/components';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
  @Input() onlyMine = false;

  allPostsLoading$ = new BehaviorSubject(false);
  limit$ = new BehaviorSubject(50);
  offset$ = new BehaviorSubject(0);

  post: IPost;
  postForm: FormGroup;

  postSetLike$ = new Subject<{ postID: string, flag: boolean }>();

  initialPosts$ = combineLatest(this.limit$, this.offset$).pipe(
    debounceTime(500),
    tap(() => { this.allPostsLoading$.next(true); }),
    switchMap(([limit, offset]) => {
      return this.onlyMine
        ? this.postsService.getMyPosts(limit, offset)
        : this.postsService.getFeed(limit, offset);
    }),
    tap(() => this.allPostsLoading$.next(false))
  );

  posts$ = merge(
    this.initialPosts$.pipe(map(posts => ({
      event: 'posts-fetch',
      data: { posts },
    }))),
    this.wsService.event$
  ).pipe(
    filter(x =>
      x.event.startsWith('post') ||
      x.event.startsWith('comment')
    ),
    scan<any>((acc, { event, data }) => {
      if (['posts-fetch', 'post-add'].includes(event)) {
        return mergePosts(acc, data.post ? [data.post] : data.posts);
      }

      const post = acc.find(x =>
        x.id === R.path(['post', 'id'], data) ||
        x.id === R.path(['comment', 'parent', 'id'], data)
      );

      if (!post) { return acc; }
      // Bellow this should be events that edit the existing post!
      const postEditedAcc = (postOverrides: Partial<IPost>) => mergePosts(
        acc,
        [{ ...post, ...postOverrides }]
      );

      if (event === 'post-edit') {
        return postEditedAcc(
          // edit event doesn't send those omitted data. so those fields
          // will have default values.
          R.omit(['iLike', 'likeCount', 'childrenCount'], data.post)
        );
      } else if (['post-like', 'post-unlike'].includes(event)) {
        const iLike = event === 'post-like' ? true : false;
        if (post.iLike !== iLike) {
          return postEditedAcc({ iLike, likeCount: post.likeCount + (iLike ? 1 : -1) });
        }
      } else if (event === 'comment-add') {
        return postEditedAcc({
          childrenCount: post.childrenCount + 1,
          children: mergePosts(post.children || [], [data.comment]),
        });
      }
      return acc;
    }, [])
  );

  unsubscribe$: Subject<void>;
  singlePostLoading: boolean;

  constructor(
    private wsService: WsService,
    private postsService: PostsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
  }

  ngOnInit() {
    this.unsubscribe$ = new Subject<void>();
    this.postForm = this.fb.group({
      text: new FormControl('', [Validators.required]),
    });

    this.postSetLike$.pipe(
      throttle(({postID, flag}) => this.postsService.setLike(postID, flag)),
      takeUntil(this.unsubscribe$)
    ).subscribe();
  }

  addNewPost(): any {
    if (this.postForm.invalid) {
      return;
    }
    this.post = this.postForm.value;
    this.singlePostLoading = true;
    this.postsService.createPost(this.post)
      .subscribe(res => {
        this.singlePostLoading = false;
        this.postForm.reset();
    });
  }

  openPostDetails(post: IPost) {
    const modal = this.modalService.open(PostDetailsModalComponent, {size: 'lg', keyboard: false});
    modal.componentInstance.post$ = this.posts$.pipe(
      map(posts => posts.find(x => x.id === post.id))
    );
  }

  onLike(postID: string): void {
    this.postSetLike$.next({ postID, flag: true });
  }
  onUnlike(postID: string): void {
    this.postSetLike$.next({ postID, flag: false });
  }
}
