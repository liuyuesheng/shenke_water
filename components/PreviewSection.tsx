
import React, { useEffect, useRef, useState } from 'react';
import { ImageFile, WatermarkSettings } from '../types';
import { applyWatermark } from '../utils/imageProcessor';

interface Props {
  file?: ImageFile;
  settings: WatermarkSettings;
}

const PreviewSection: React.FC<Props> = ({ file, settings }) => {
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!file) return;

    const generatePreview = async () => {
      setLoading(true);
      try {
        const blob = await applyWatermark(file.file, settings);
        const url = URL.createObjectURL(blob);
        setPreviewBlobUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch (e) {
        console.error('Preview failed', e);
      } finally {
        setLoading(false);
      }
    };

    // Debounce preview generation
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(generatePreview, 150);

    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, [file, settings]);

  if (!file) {
    return (
      <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 italic text-slate-500">
        Select an image to see preview
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center group">
      {previewBlobUrl && (
        <img 
          src={previewBlobUrl} 
          className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`} 
          alt="Preview" 
        />
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
        Watermarked Preview
      </div>
    </div>
  );
};

export default PreviewSection;
