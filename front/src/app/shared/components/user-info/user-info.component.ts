import {Component, Input, OnInit} from '@angular/core';

import { IUser } from '@core/models';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent implements OnInit {
  @Input() user: IUser;
  @Input() isOwn: boolean;
  constructor(
  ) { }

  ngOnInit() {
    console.log(this.user);
  }

}
