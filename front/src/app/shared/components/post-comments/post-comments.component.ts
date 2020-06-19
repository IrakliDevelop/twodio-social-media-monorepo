import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject, combineLatest, BehaviorSubject, merge} from 'rxjs';
import {takeUntil, debounceTime, tap, filter, scan, map, switchMap} from 'rxjs/operators';

import {PostsService, WsService} from '@core/services';
import {mergePosts} from '@core/utils';
import {IPost, IComment} from '@core/models';

@Component({
  selector: 'app-post-comments',
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.scss'],
})
export class PostCommentsComponent implements OnInit {
  @Input() post: IPost;

  @Output() like: EventEmitter<string> = new EventEmitter<string>();
  @Output() unlike: EventEmitter<string> = new EventEmitter<string>();

  commentForm: FormGroup;
  comment: string;
  comments: IComment[];

  loading$ = new BehaviorSubject<boolean>(false);
  limit$ = new BehaviorSubject<number>(20);
  offset$ = new BehaviorSubject<number>(0);

  initialComments$ = combineLatest(this.limit$, this.offset$).pipe(
    debounceTime(500),
    tap(() => { this.loading$.next(true); }),
    switchMap(([first, offset]) =>
      this.postsService.getComments(this.post.id, { first, offset })
    ),
    tap(() => this.loading$.next(false))
  );

  comments$ = merge(
    this.initialComments$.pipe(map(comments => ({
      event: 'comments-fetch',
      data: { comments },
    }))),
    this.wsService.event$
  ).pipe(
    filter(x => x.event.startsWith('comment')),
    scan<any>((acc, { event, data }) => {
      if (['comments-fetch', 'comment-add'].includes(event)) {
        return mergePosts(acc, data.comment ? [data.comment] : data.comments);
      }

      return acc;
    }, [])
  );

  unsubscribe$: Subject<void>;
  constructor(
    private postsService: PostsService,
    private wsService: WsService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.unsubscribe$ = new Subject<void>();
    this.commentForm = this.fb.group({
      comment: new FormControl('', [Validators.required]),
    });
  }
  addComment(): void {
    if (this.commentForm.invalid) {
      return;
    }
    const { comment } = this.commentForm.value;
    this.comment = comment;
    console.log(this.comment, typeof this.comment);
    if (!this.comment.replace(/\s/g, '').length) { // TODO: add check on spaces in validator patterns
      return;
    }
    this.loading$.next(true);
    this.postsService.addComment(this.post.id, this.comment).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe( res => {
      this.loading$.next(false);
      this.commentForm.reset();
    });
  }
  onPostLikeClicked(comment: IPost): void {
    comment.iLike ? this.like.emit(comment.id) : this.unlike.emit(comment.id);
  }
}
