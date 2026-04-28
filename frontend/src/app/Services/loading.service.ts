import { Injectable, signal } from '@angular/core';

// N5: Loading state global — el comptador evita que peticions concurrent es cancel·lin entre si
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  readonly loading = signal(false);

  start() {
    this.count++;
    this.loading.set(true);
  }

  stop() {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) this.loading.set(false);
  }
}