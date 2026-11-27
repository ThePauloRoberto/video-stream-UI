import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { VideoCatalogService } from '../services/video-catalog.service';
import { VideoSummary } from '../models/video-summary.model';

@Component({
  selector: 'mfe-catalog-view',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent implements OnInit {
  private readonly catalogService = inject(VideoCatalogService);
  private readonly router = inject(Router);

  // Estado reativo gerenciado com Angular Signals
  readonly videos = signal<VideoSummary[]>([]);
  readonly loading = signal<boolean>(true);
  readonly uploading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly uploadMessage = signal<string | null>(null);
  readonly searchQuery = signal<string>('');

  readonly filteredVideos = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const all = this.videos();
    if (!query) {
      return all;
    }
    return all.filter((video) => video.id.toLowerCase().includes(query));
  });

  readonly totalVideos = computed(() => this.videos().length);

  readonly totalSizeFormatted = computed(() => {
    const totalBytes = this.videos().reduce((acc, item) => acc + (item.sizeBytes || 0), 0);
    return this.formatBytes(totalBytes);
  });

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.catalogService.listVideos(50).subscribe({
      next: (items) => {
        this.videos.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.message || 'Não foi possível conectar à API.');
        this.loading.set(false);
      },
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.uploading.set(true);
    this.error.set(null);
    this.uploadMessage.set(null);

    this.catalogService.uploadVideo(file).subscribe({
      next: (metadata) => {
        this.uploading.set(false);
        this.uploadMessage.set(
          `Vídeo '${metadata.id}' (${this.formatBytes(metadata.sizeBytes)}) enviado com sucesso!`
        );
        input.value = '';
        this.loadVideos();
      },
      error: (err) => {
        this.uploading.set(false);
        this.error.set(
          err?.error?.message || err?.message || 'Falha ao enviar o vídeo para o bucket S3.'
        );
        input.value = '';
      },
    });
  }

  openPlayer(videoId: string): void {
    this.router.navigate(['/player', videoId]);
  }

  extractExtension(videoId: string): string {
    const dot = videoId.lastIndexOf('.');
    return dot >= 0 ? videoId.substring(dot + 1).toUpperCase() : 'VIDEO';
  }

  formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) {
      return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
  }
}
