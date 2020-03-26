import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, Subject} from 'rxjs';
import {Router} from '@angular/router';

import { AuthService } from '@core/services';



@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  error$: BehaviorSubject<any | null>;
  unsubscribe$: Subject<void>;
  constructor(
    public fb: FormBuilder,
    private authService: AuthService,
    public router: Router
  ) { }

  ngOnInit() {
    this.unsubscribe$ = new Subject<void>();
    this.error$ = new BehaviorSubject<any|null>(null);
    this.signUpForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      firstname: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
    });
  }

}
