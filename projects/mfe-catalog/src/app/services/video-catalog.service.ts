import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoMetadata, VideoSummary } from '../models/video-summary.model';

@Injectable({
  providedIn: 'root',
})
export class VideoCatalogService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8080';

  /**
   * Consome GET /api/v1/videos?limit=50
   */
  listVideos(limit = 50): Observable<VideoSummary[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<VideoSummary[]>(`${this.apiBaseUrl}/api/v1/videos`, { params });
  }

  /**
   * Consome POST /api/videos/upload (MultipartFile)
   * Sanitiza o identificador do vídeo para atender ao padrão do domínio:
   * ^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$
   */
  uploadVideo(file: File, customId?: string): Observable<VideoMetadata> {
    const rawName = customId && customId.trim() ? customId.trim() : file.name;
    const safeVideoId = this.sanitizeVideoId(rawName);

    const formData = new FormData();
    formData.append('file', file, safeVideoId);

    const params = new HttpParams().set('id', safeVideoId);
    return this.http.post<VideoMetadata>(`${this.apiBaseUrl}/api/videos/upload`, formData, { params });
  }

  /**
   * Remove acentos, parênteses, espaços e caracteres fora de [A-Za-z0-9._-]
   * para evitar erro 400 (INVALID_VIDEO_ID) ao selecionar arquivos do computador.
   */
  sanitizeVideoId(filename: string): string {
    if (!filename || !filename.trim()) {
      return `video-${Date.now()}.mp4`;
    }
    const withoutAccents = filename
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    let sanitized = withoutAccents
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^[^A-Za-z0-9]+/, '')
      .replace(/[-._]+$/, '');

    if (!sanitized) {
      sanitized = `video-${Date.now()}.mp4`;
    }
    if (sanitized.length > 128) {
      const dotIndex = sanitized.lastIndexOf('.');
      const ext = dotIndex >= 0 ? sanitized.substring(dotIndex) : '.mp4';
      sanitized = sanitized.substring(0, 128 - ext.length) + ext;
    }
    return sanitized;
  }
}
