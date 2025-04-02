import { Component } from '@angular/core';

import {MatButtonModule} from '@angular/material/button';
import { SharedModule } from '../../shared/shared.module';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, SharedModule, TranslocoModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
