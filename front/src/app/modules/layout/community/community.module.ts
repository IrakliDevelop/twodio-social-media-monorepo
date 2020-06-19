import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';

import { CommunityRoutingModule } from './community-routing.module';
import { UserSearchComponent } from './user-search/user-search.component';

@NgModule({
  declarations: [UserSearchComponent],
  imports: [
    CommonModule,
    CommunityRoutingModule,
    SharedModule,
  ],
})
export class CommunityModule { }
