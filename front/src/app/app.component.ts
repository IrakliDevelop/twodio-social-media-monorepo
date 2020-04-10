import { Component } from '@angular/core';
import {AuthService} from '@core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor(private authService: AuthService) {
  }
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
