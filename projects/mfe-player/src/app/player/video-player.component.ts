import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';

export interface VideoMetadataDto {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  etag?: string;
  lastModified?: string;
  streamUrl: string;
}

@Component({
  selector: 'mfe-video-player',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8080';

  // Estado reativo gerenciado com Angular Signals
  readonly videoId = signal<string>('');
  readonly metadata = signal<VideoMetadataDto | null>(null);
  readonly playerError = signal<string | null>(null);
  readonly currentTime = signal<number>(0);
  readonly duration = signal<number>(0);
  readonly bufferedPercent = signal<number>(0);

  /**
   * URL do stream consumida pela tag <video controls>
   * Aponta para http://localhost:8080/api/v1/videos/{id}/stream
   */
  readonly streamUrl = computed(() => {
    const id = this.videoId();
    return id ? `${this.apiBaseUrl}/api/v1/videos/${encodeURIComponent(id)}/stream` : '';
  });

  /**
   * Suporte a withComponentInputBinding() do Angular Router (@Input de rota :id)
   */
  @Input()
  set id(value: string | undefined) {
    if (value) {
      this.setVideo(value);
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const routeId = params.get('id');
      if (routeId && routeId !== this.videoId()) {
        this.setVideo(routeId);
      }
    });
  }

  private setVideo(id: string): void {
    this.videoId.set(id);
    this.playerError.set(null);
    this.currentTime.set(0);
    this.duration.set(0);
    this.bufferedPercent.set(0);
    this.fetchMetadata(id);
  }

  private fetchMetadata(id: string): void {
    this.http
      .get<VideoMetadataDto>(`${this.apiBaseUrl}/api/v1/videos/${encodeURIComponent(id)}`)
      .subscribe({
        next: (meta) => this.metadata.set(meta),
        error: () => this.metadata.set(null),
      });
  }

  onLoadedMetadata(video: HTMLVideoElement): void {
    this.duration.set(Number.isFinite(video.duration) ? video.duration : 0);
  }

  onTimeUpdate(video: HTMLVideoElement): void {
    this.currentTime.set(video.currentTime || 0);
    this.onProgress(video);
  }

  onProgress(video: HTMLVideoElement): void {
    if (!video.duration || video.buffered.length === 0) {
      return;
    }
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    const pct = Math.min(100, Math.round((bufferedEnd / video.duration) * 100));
    this.bufferedPercent.set(pct);
  }

  onVideoError(): void {
    this.playerError.set(
      `Não foi possível reproduzir '${this.videoId()}'. Verifique se o vídeo existe no bucket e se o arquivo possui um container de vídeo válido (ex.: MP4 H.264).`
    );
  }

  formatSeconds(seconds: number): string {
    if (!seconds || !Number.isFinite(seconds)) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) {
      return '—';
    }
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
  }
}
