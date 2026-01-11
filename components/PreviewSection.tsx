
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
        // 预览时始终使用原始文件，应用最新设置
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

    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(generatePreview, 100);

    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, [file, settings]);

  if (!file) {
    return (
      <div className="aspect-[4/3] bg-black/40 rounded-2xl flex flex-col items-center justify-center border border-white/5 text-slate-600">
        <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <p className="text-xs font-medium">请先选择图片以预览效果</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center group">
      {/* 背景装饰网格 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {previewBlobUrl && (
        <img 
          src={previewBlobUrl} 
          className={`max-w-full max-h-full object-contain transition-all duration-500 ease-out shadow-2xl ${loading ? 'scale-[0.98] blur-sm opacity-50' : 'scale-100 opacity-100'}`} 
          alt="Preview" 
        />
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 transition-all">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">Rendering</span>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full text-[9px] font-bold text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0">
        高清渲染引擎预览
      </div>
    </div>
  );
};

export default PreviewSection;
