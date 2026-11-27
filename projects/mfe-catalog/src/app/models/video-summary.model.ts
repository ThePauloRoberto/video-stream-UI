/**
 * Representa o item de catálogo retornado por GET /api/v1/videos
 */
export interface VideoSummary {
  id: string;
  sizeBytes: number;
  lastModified: string;
}

/**
 * Representa a resposta de upload (POST /api/videos/upload) ou metadados (GET /api/v1/videos/{id})
 */
export interface VideoMetadata {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  etag?: string;
  lastModified?: string;
  streamUrl: string;
}
