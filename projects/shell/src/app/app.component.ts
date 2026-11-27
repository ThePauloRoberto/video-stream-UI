import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);

  readonly currentUrl = signal<string>('/catalog');
  readonly lastSelectedVideoId = signal<string>('demo.mp4');

  readonly activeMfeLabel = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/player')) {
      return 'Remoto ativo: MFE-Player (:4202)';
    }
    return 'Remoto ativo: MFE-Catalog (:4201)';
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        const match = event.urlAfterRedirects.match(/^\/player\/([^/?#]+)/);
        if (match?.[1]) {
          this.lastSelectedVideoId.set(decodeURIComponent(match[1]));
        }
      });
  }
}
