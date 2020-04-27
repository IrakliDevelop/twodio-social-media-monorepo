import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { LoginRoutingModule } from './login-routing.module';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { SetupProfileComponent } from './setup/setup-profile.component';



@NgModule({
  declarations: [SignInComponent, SignUpComponent, PasswordResetComponent, SetupProfileComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    SharedModule,
  ],
})
export class LoginModule { }
