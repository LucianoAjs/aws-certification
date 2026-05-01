import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
}
