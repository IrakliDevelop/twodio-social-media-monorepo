import {APP_INITIALIZER, ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AmplifyModules, AmplifyService} from 'aws-amplify-angular';
import Auth from '@aws-amplify/auth';
import Storage from '@aws-amplify/storage';
import Interactions from '@aws-amplify/interactions';

import { AuthGuard } from './guards';
import { AuthService, AuthServiceFactory, WsService } from './services';
import { AuthInterceptorService } from './utils';
import { throwIfAlreadyLoaded } from './throw-if-already-loaded';


const PROVIDERS = [
  AuthGuard,
  AuthService,
  WsService,
  { provide: APP_INITIALIZER, useFactory: AuthServiceFactory, deps: [AuthService], multi: true },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptorService,
    multi: true,
  },
  {
    provide: AmplifyService,
    useFactory:  () => {
      return AmplifyModules({
        Auth,
        Storage,
        Interactions,
      });
    },
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
