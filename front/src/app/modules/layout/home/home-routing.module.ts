import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {FeedComponent} from './feed/feed.component';


const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: { title: 'home' },
  },
  {
    path: 'feed',
    component: FeedComponent,
    data: { title: 'feed' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule { }
