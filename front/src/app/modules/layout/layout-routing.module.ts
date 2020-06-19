import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from '@core/guards';
import {LayoutComponent} from './layout.component';


const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [{
      path: '',
      loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
      canActivate: [AuthGuard],
    },
      {
        path: 'user',
        loadChildren: () => import('./community/community.module').then(m => m.CommunityModule),
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: '', redirectTo: 'login', pathMatch: 'full',
  }, {
    path: '**', redirectTo: 'login',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule { }
