import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatButtonToggleModule, TranslocoModule]
})
export class HeaderComponent {
  activeLink = '';

  constructor(private router: Router, private transloco: TranslocoService) {
    this.initializeLanguage();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeLink = event.urlAfterRedirects.replace('/', '');
      }
    });
  }

  private initializeLanguage() {
    if (this.isBrowser()) {
      const storedLang = localStorage.getItem('language');
      this.transloco.setActiveLang(storedLang || 'ru'); // Устанавливаем язык по умолчанию
    } else {
      this.transloco.setActiveLang('ru'); // Устанавливаем язык по умолчанию для сервера
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  changeLanguage(lang: string) {
    this.transloco.setActiveLang(lang);
    if (this.isBrowser()) {
      localStorage.setItem('language', lang); // Сохраняем язык в localStorage
    }
  }

  navigate(link: string) {
    this.router.navigate([`/${link}`]);
  }
}
