import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {BehaviorSubject, Subject} from 'rxjs';
import {finalize, first, takeUntil} from 'rxjs/operators';
import {Router} from '@angular/router';

import { AuthService } from '@core/services';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit, OnDestroy {
  signUpForm: FormGroup;
  emailConfirmationRequired = false;
  loading: boolean;
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
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      repeatPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
      code: [''],
    });
  }

  onSignUp(): void {
    if (!this.signUpForm.valid) {
      return;
      // TODO: handle validation
    }
    const { email, password, repeatPassword } = this.signUpForm.value;
    if (password !== repeatPassword) {
      this.error$.next('passwords don\'t match');
      return;
    }
    this.loading = true;
    this.authService.signUp(email, password ).pipe(
      takeUntil(this.unsubscribe$),
      finalize(() => this.loading = false)
    ).subscribe(data => {
      console.log(data);
      this.emailConfirmationRequired = true;
    }, err => {
      console.error(err);
      this.error$.next(err);
    });
  }

  confirmClick() {
    const { email, password, code } = this.signUpForm.getRawValue();
    this.cognitoConfirmSignUp(email, password, code);
  }

  cognitoConfirmSignUp(email: string, password: string, code: string) {
    this.loading = true;
    this.authService.confirmSignUp(email, code)
      .pipe(first())
      .subscribe(() => {
        this.signInAfterRegistration(email, password);
      }, err => {
        this.error$.next(err);
        this.loading = false;
      });
  }
  signInAfterRegistration(email: string, password: string) {
    this.loading = true;

    this.authService.signIn(email, password)
      .pipe(first(),
      finalize(() => this.loading = false)
      ).subscribe(() => {
        this.router.navigate(['/login']);
      }, err => {
        console.log(err);
        this.error$.next(err);
        this.router.navigate(['/login']);
      });
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
