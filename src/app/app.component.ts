import { Component } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective, TranslocoModule } from '@jsverse/transloco';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSnackBarModule, TranslocoModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Testovoe';
}
