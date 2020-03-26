import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Router} from '@angular/router';

import { AuthService } from '@core/services';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit, OnDestroy {
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
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      repeatPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  onSignUp(): void {
    if (!this.signUpForm.valid) {
      return;
      // TODO: handle validation
    }
    const { email, password, repeatPassword } = this.signUpForm.value;
    console.log(email, password, repeatPassword);
    if (password !== repeatPassword) {
      this.error$.next('passwords don\'t match');
      return;
    }
    this.authService.signUp(email, password ).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(data => {
      console.log(data);
    }, err => {
      console.error(err);
      this.error$.next(err);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
