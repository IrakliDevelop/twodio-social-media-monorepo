import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';


const routes: Routes = [
  {
    path: '',
    component: SignInComponent,
    data: { title: 'Sign In' },
  }, {
    path: 'register',
    component: SignUpComponent,
    data: { title: 'Sign Up' },
  },  {
    path: 'reset',
    component: PasswordResetComponent,
    data: { title: 'Reset Password' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRoutingModule { }
