import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {UserSearchComponent} from './user-search/user-search.component';


const routes: Routes = [
  { path: 'search',
  component: UserSearchComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommunityRoutingModule { }
