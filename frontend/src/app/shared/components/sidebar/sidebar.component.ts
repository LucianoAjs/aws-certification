import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

interface SidebarItem {
  label: string;
  routerLink: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly router = inject(Router);

  @Input() isMobile = false;
  @Input() isSidebarCollapsed = false;
  @Output() closeRequested = new EventEmitter<void>();

  currentUrl = this.router.url;

  readonly menuItems: SidebarItem[] = [
    { label: 'Dashboard', routerLink: '/dashboard', icon: 'pi pi-home' },
    { label: 'Simulado', routerLink: '/simulado', icon: 'pi pi-stopwatch' },
    { label: 'Temas', routerLink: '/temas', icon: 'pi pi-book' },
    { label: 'Tentativas', routerLink: '/tentativas', icon: 'pi pi-chart-line' },
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

  get isCollapsedRail(): boolean {
    return this.isSidebarCollapsed && !this.isMobile;
  }
}
