import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';

import {PostsService} from '@core/services';
import {IPost, IComment} from '@core/models';

@Component({
  selector: 'app-post-comments',
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.scss'],
})
export class PostCommentsComponent implements OnInit {
  @Input() post: IPost;
  commentForm: FormGroup;
  comment: string;
  comments: IComment[];

  unsubscribe$: Subject<void>;
  loading: boolean;
  constructor(
    private postsService: PostsService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.unsubscribe$ = new Subject<void>();
    this.commentForm = this.fb.group({
      comment: new FormControl('', [Validators.required]),
    });
    this.loadComments();
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
    this.loading = true;
    this.postsService.addComment(this.post.id, this.comment).pipe(
      takeUntil(this.unsubscribe$),
      finalize(() => this.loading = false)
    ).subscribe( res => {
      this.commentForm.reset();
      console.log(res);
    });
  }
  loadComments(): void {
    this.loading = true;
    this.postsService.getComments(this.post.id)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this.loading = false)
      ).subscribe( res => {
        this.comments = res;
    });
  }

}
