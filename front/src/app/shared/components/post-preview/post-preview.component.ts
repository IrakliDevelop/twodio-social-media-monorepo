import {Component, Input, OnInit} from '@angular/core';
import { IPost } from '@core/models';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
})
export class PostPreviewComponent implements OnInit {
  @Input() post: IPost;
  constructor() { }

  ngOnInit() {
  }

}
