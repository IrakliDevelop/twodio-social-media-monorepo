import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from './material.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxLoadingModule} from 'ngx-loading';
import {
  HeaderComponent,
  FooterComponent,
  SidebarComponent,
  UserInfoComponent,
  UserInfoModalComponent,
  PostPreviewComponent,
} from '@shared/components';


const SHARED_MODULES = [
  MaterialModule,
  FormsModule,
  ReactiveFormsModule,
  NgbModule,
  NgxLoadingModule,
];

@NgModule({
  declarations: [HeaderComponent,
    FooterComponent,
    SidebarComponent,
    UserInfoComponent,
    UserInfoModalComponent,
    PostPreviewComponent],
  imports: [
    CommonModule,
    ...SHARED_MODULES,
    RouterModule,
  ],
  exports: [
    ...SHARED_MODULES,
    HeaderComponent,
    SidebarComponent,
    UserInfoComponent,
    UserInfoModalComponent,
    PostPreviewComponent,
  ],
  entryComponents: [
    UserInfoModalComponent,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
    } as ModuleWithProviders;
  }
}
