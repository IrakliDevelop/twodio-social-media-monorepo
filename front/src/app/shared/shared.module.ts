import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxLoadingModule } from 'ngx-loading';
import { HeaderComponent } from '@shared/components';
import { FooterComponent } from '@shared/components';
import { SidebarComponent } from './components/sidebar/sidebar.component';


const SHARED_MODULES = [
  MaterialModule,
  FormsModule,
  ReactiveFormsModule,
  NgbModule,
  NgxLoadingModule,
];

@NgModule({
  declarations: [HeaderComponent, FooterComponent, SidebarComponent],
  imports: [
    CommonModule,
    ...SHARED_MODULES,
  ],
  exports: [
    ...SHARED_MODULES,
    HeaderComponent,
    SidebarComponent,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
    } as ModuleWithProviders;
  }
}
