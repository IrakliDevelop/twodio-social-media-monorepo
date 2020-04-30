import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from '@core/services';
import { IUser } from '@core/models/user.model';
import { UserService } from '@core/services/user/user.service';

@Component({
  selector: 'app-setup-profile',
  templateUrl: './setup-profile.component.html',
  styleUrls: ['./setup-profile.component.scss'],
})
export class SetupProfileComponent implements OnInit {
  private unsubscribe$: Subject<void>;
  profileForm: FormGroup;
  error$: BehaviorSubject<any | null>;
  loading: boolean;
  user: IUser;

  constructor(
    public fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.unsubscribe$ = new Subject<void>();
    this.error$ = new BehaviorSubject<any|null>(null);
    this.loading = false;
    this.profileForm = this.fb.group({
      email: [this.authService.getUserEmail()],
      handle: new FormControl('', Validators.compose([Validators.required, Validators.minLength(5)])),
      phone: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/\b5\d{8}\b/)])),
    });
  }

  onSetup() {
    if (!this.profileForm.valid) {
      this.profileForm.markAllAsTouched();
      this.error$.next('Please Enter valid input');
      return;
    }
    this.user = this.profileForm.getRawValue();
    console.log(this.user);
    this.error$.next(null);
    this.userService.finishRegistration(this.user).subscribe(res => {
      if (res.ok) {
        this.router.navigate(['']);
      }
    });
  }

}
