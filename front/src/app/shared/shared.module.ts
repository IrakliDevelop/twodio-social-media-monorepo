import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxLoadingModule } from 'ngx-loading';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';


const SHARED_MODULES = [
  MaterialModule,
  FormsModule,
  ReactiveFormsModule,
  NgbModule,
  NgxLoadingModule,
];

@NgModule({
  declarations: [HeaderComponent, FooterComponent],
  imports: [
    CommonModule,
    ...SHARED_MODULES,
  ],
  exports: [
    ...SHARED_MODULES,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
    } as ModuleWithProviders;
  }
}
