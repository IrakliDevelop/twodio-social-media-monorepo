import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {IUser} from '@core/models';

@Component({
  selector: 'app-user-info-modal',
  templateUrl: './user-info-modal.component.html',
  styleUrls: ['./user-info-modal.component.scss'],
})
export class UserInfoModalComponent implements OnInit {
  @Input() user: IUser;
  @Input() isOwn: boolean;
  @Output() followUser: EventEmitter<IUser> = new EventEmitter<IUser>();
  @Output() unFollowUser: EventEmitter<IUser> = new EventEmitter<IUser>();
  constructor(
    public modalRef: NgbActiveModal
  ) { }

  ngOnInit() {
  }
  onFollowClick(): void {
    this.followUser.emit(this.user);
  }
  onUnFollowClick(): void {
    this.unFollowUser.emit(this.user);
  }

}
