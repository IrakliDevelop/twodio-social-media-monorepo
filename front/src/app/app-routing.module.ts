import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from '@core/guards';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule),
    canActivate: [],
  },
  {
    path: 'user',
    loadChildren: () => import('./modules/community/community.module').then(m => m.CommunityModule),
    canActivate: [AuthGuard],
  },
  {
    path: '', redirectTo: 'login', pathMatch: 'full',
  }, {
    path: '**', redirectTo: 'login',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
