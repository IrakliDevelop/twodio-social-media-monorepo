import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import {IPost} from '@core/models';


@Component({
  selector: 'app-post-details-modal',
  templateUrl: './post-details-modal.component.html',
  styleUrls: ['./post-details-modal.component.scss'],
})
export class PostDetailsModalComponent implements OnInit {
  @Input() post: IPost;
  constructor(
    public modalRef: NgbActiveModal
  ) { }

  ngOnInit() {
  }

}
