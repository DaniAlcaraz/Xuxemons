import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { LoadingService } from './Services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly loadingService = inject(LoadingService);
  private readonly router           = inject(Router);
  private readonly titleService     = inject(Title);
  private readonly metaService      = inject(Meta);

  constructor() {
    // N5: Actualitza el title i la meta description dinàmicament en cada canvi de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const routeData = this.router.routerState.snapshot.root.firstChild?.data;
      const title       = routeData?.['title']       ?? 'Xuxemons';
      const description = routeData?.['description'] ?? 'Xuxemons - Joc de col·lecció';
      this.titleService.setTitle(title);
      this.metaService.updateTag({ name: 'description', content: description });
    });
  }
}