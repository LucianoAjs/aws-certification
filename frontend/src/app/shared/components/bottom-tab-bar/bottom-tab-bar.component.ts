import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

interface TabItem {
  label: string;
  routerLink: string;
  icon: string;
}

@Component({
  selector: 'app-bottom-tab-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-tab-bar.component.html',
  styleUrl: './bottom-tab-bar.component.scss',
})
export class BottomTabBarComponent {
  private readonly router = inject(Router);

  currentUrl = this.router.url;

  readonly tabs: TabItem[] = [
    { label: 'Home', routerLink: '/dashboard', icon: 'pi pi-home' },
    { label: 'Simulado', routerLink: '/simulado', icon: 'pi pi-stopwatch' },
    { label: 'Temas', routerLink: '/temas', icon: 'pi pi-book' },
    { label: 'Histórico', routerLink: '/tentativas', icon: 'pi pi-history' },
  ];

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  isActive(route: string): boolean {
    return this.currentUrl === route || this.currentUrl.startsWith(`${route}/`);
  }
}
