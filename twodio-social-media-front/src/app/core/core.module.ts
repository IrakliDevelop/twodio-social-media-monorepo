import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthGuard} from './guards';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthService} from './services';
import { AuthInterceptorService } from './utils';
import {throwIfAlreadyLoaded} from './throw-if-already-loaded';

const PROVIDERS = [
  AuthGuard,
  AuthService,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptorService,
    multi: true,
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: PROVIDERS,
    } as ModuleWithProviders;
  }
}
