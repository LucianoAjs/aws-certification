import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ViewportService } from '../../../core/services/viewport.service';
import { BottomTabBarComponent } from '../../components/bottom-tab-bar/bottom-tab-bar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    ToolbarComponent,
    BottomTabBarComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly viewport = inject(ViewportService);
  private readonly router = inject(Router);

  protected readonly isNarrowShell = toSignal(this.viewport.isNarrowShell$, {
    initialValue: false,
  });

  isSidebarCollapsed = false;

  constructor() {
    this.viewport.isNarrowShell$.pipe(takeUntilDestroyed()).subscribe((narrow) => {
      this.isSidebarCollapsed = narrow;
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this.isNarrowShell()) {
          this.isSidebarCollapsed = true;
        }
      });
  }

  onToggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onSidebarOverlayClose() {
    this.isSidebarCollapsed = true;
  }
}
