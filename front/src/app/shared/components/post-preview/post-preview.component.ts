import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { IPost } from '@core/models';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
})
export class PostPreviewComponent implements OnInit {
  @Input() post: IPost;
  @Output() like: EventEmitter<string> = new EventEmitter<string>();
  @Output() unlike: EventEmitter<string> = new EventEmitter<string>();
  // TODO: this should be bound with post model
  liked: boolean;
  constructor() { }

  ngOnInit() {
  }

  onPostLikeClicked(): void {
    this.liked = !this.liked;
    this.liked ? this.like.emit(this.post.id) : this.unlike.emit(this.post.id);
  }

}
