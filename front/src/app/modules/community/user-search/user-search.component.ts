import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss'],
})
export class UserSearchComponent implements OnInit {
  userSearchControl: FormControl;
  userSearch: string;

  constructor() { }

  ngOnInit() {
    this.userSearchControl = new FormControl('', [Validators.required]);
  }
  private _searchSubscribe(): void {
    this.userSearchControl.valueChanges.pipe().subscribe(data => this.userSearch = data);
  }

}
