import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import { IUser } from '@core/models';

@Component({
  selector: 'app-user-info-modal',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent implements OnInit {
  @Input() user: IUser;
  constructor(
    public modalRef: NgbActiveModal
  ) { }

  ngOnInit() {
    console.log(this.user);
  }

}
