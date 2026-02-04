export interface ThumbnailSettings {
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
  quality: 'low' | 'medium' | 'high';
  format: 'webp' | 'jpeg' | 'png';
  lazy: boolean;
  placeholder?: string;
  alt?: string;
  autoGenerate: boolean;
}

export interface ThumbnailConfig {
  width: number;
  height: number;
  crop: boolean;
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export interface ThumbnailData {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  settings: ThumbnailSettings;
  config: ThumbnailConfig;
  createdAt: string;
  updatedAt: string;
}
