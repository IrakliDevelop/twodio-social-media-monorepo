import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import {IPost} from '@core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-post-details-modal',
  templateUrl: './post-details-modal.component.html',
  styleUrls: ['./post-details-modal.component.scss'],
})
export class PostDetailsModalComponent implements OnInit {
  @Input() post$: Observable<IPost>;
  constructor(
    public modalRef: NgbActiveModal
  ) { }

  ngOnInit() {
    this.post$.subscribe(x => console.log('post details modal:', JSON.stringify(x)));
  }
}
