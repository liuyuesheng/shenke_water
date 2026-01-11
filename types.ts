
export interface WatermarkSettings {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'tile' | 'top-bottom';
  fontFamily: string;
  rotation: number;
}

export interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  previewUrl: string;
  processedBlob?: Blob;
}

export type ProcessingStats = {
  total: number;
  completed: number;
  failed: number;
};
