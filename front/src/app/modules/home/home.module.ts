import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FeedComponent } from './feed/feed.component';


@NgModule({
  declarations: [DashboardComponent, FeedComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
  ],
})
export class HomeModule { }
