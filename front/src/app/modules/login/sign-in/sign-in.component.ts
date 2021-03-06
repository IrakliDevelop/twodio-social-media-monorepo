import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';

import {AuthService} from '@core/services';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit, OnDestroy {
  signInForm: FormGroup;
  error$: BehaviorSubject<any | null>;
  unsubscribe$: Subject<void>;
  loading: boolean;

  constructor(public fb: FormBuilder,
              private authService: AuthService,
              public router: Router) { }

  ngOnInit() {
    this.unsubscribe$ = new Subject<void>();
    this.error$ = new BehaviorSubject<any|null>(null);
    this.signInForm = this.fb.group({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.required),
    });

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['']);
    }
  }
  onSignIn(): void {
    const { email, password } = this.signInForm.value;
    if (!this.signInForm.valid) {
      this.error$.next('Please, fill out all fields');
      return;
    }
    this.loading = true;
    this.authService.signIn(email, password)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this.loading = false)
      ).subscribe( data => {
        console.log(data);
        this.router.navigate(['']).then(() => this.loading = false);
    }, err => {
        console.error(err);
        this.error$.next(err.message);
    });
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
