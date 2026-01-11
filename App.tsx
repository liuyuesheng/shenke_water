
import React, { useState, useMemo, useCallback } from 'react';
import { WatermarkSettings, ImageFile, ProcessingStats } from './types';
import FileUploader from './components/FileUploader';
import WatermarkControls from './components/WatermarkControls';
import PreviewSection from './components/PreviewSection';
import ProcessingStatus from './components/ProcessingStatus';
import { applyWatermark } from './utils/imageProcessor';
import JSZip from 'https://esm.sh/jszip@3.10.1';

const DEFAULT_SETTINGS: WatermarkSettings = {
  text: '深氪旷工',
  fontSize: 48,
  color: '#ffffff',
  opacity: 0.6,
  positions: ['center'],
  fontFamily: 'Inter, system-ui, sans-serif',
  rotation: 0,
};

export default function App() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveDirHandle, setSaveDirHandle] = useState<any>(null);

  const stats = useMemo<ProcessingStats>(() => ({
    total: files.length,
    completed: files.filter(f => f.status === 'completed').length,
    failed: files.filter(f => f.status === 'error').length,
  }), [files]);

  const handleFilesSelected = (newFiles: File[]) => {
    const formatted = newFiles
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: crypto.randomUUID(),
        file: f,
        name: f.name,
        size: f.size,
        status: 'pending' as const,
        previewUrl: URL.createObjectURL(f),
      }));
    setFiles(prev => [...prev, ...formatted]);
  };

  const selectSaveDirectory = async () => {
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker();
      setSaveDirHandle(handle);
    } catch (err) {
      console.error('Directory selection cancelled or failed', err);
    }
  };

  const clearAll = useCallback(() => {
    files.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
    setIsProcessing(false);
  }, [files]);

  const processBatch = async () => {
    if (isProcessing || files.length === 0) return;
    setIsProcessing(true);

    // 1. 自动重置状态：开始新的生成前清空旧结果
    setFiles(prev => prev.map(f => ({ 
      ...f, 
      status: 'pending' as const, 
      processedBlob: undefined 
    })));

    // 遍历处理
    for (let i = 0; i < files.length; i++) {
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f));
      
      try {
        const currentItem = files[i];
        const blob = await applyWatermark(currentItem.file, settings);
        const newPreviewUrl = URL.createObjectURL(blob);

        // 如果设置了本地回写目录，直接写入
        if (saveDirHandle) {
          try {
            const fileHandle = await saveDirHandle.getFileHandle(`marked_${currentItem.name}`, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
          } catch (writeErr) {
            console.error('Write to directory failed', writeErr);
          }
        }
        
        setFiles(prev => prev.map((f, idx) => {
          if (idx === i) {
            URL.revokeObjectURL(f.previewUrl);
            return { 
              ...f, 
              status: 'completed', 
              processedBlob: blob,
              previewUrl: newPreviewUrl
            };
          }
          return f;
        }));
      } catch (err) {
        console.error('Batch error:', err);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
      }
    }
    setIsProcessing(false);
  };

  const downloadAllAsZip = async () => {
    const done = files.filter(f => f.status === 'completed' && f.processedBlob);
    if (done.length === 0) return;

    const zip = new JSZip();
    done.forEach(f => zip.file(`marked_${f.name}`, f.processedBlob!));
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Marked_Images_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tightest">MarkMaster <span className="text-blue-500 italic">PRO</span></h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">本地化批量图像处理引擎</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={selectSaveDirectory}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border flex items-center gap-2 ${saveDirHandle ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
              {saveDirHandle ? '回写目录已就绪' : '选择保存目录'}
            </button>

            {files.length > 0 && (
              <button 
                onClick={clearAll}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-30"
              >
                清除任务
              </button>
            )}

            <button 
              onClick={processBatch}
              disabled={files.length === 0 || isProcessing}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 px-8 py-2.5 rounded-xl text-sm font-black transition-all shadow-2xl shadow-blue-900/40 active:scale-95 flex items-center gap-3"
            >
              {isProcessing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {isProcessing ? '正在导出...' : '开始生成'}
            </button>
            
            {!saveDirHandle && stats.completed > 0 && (
              <button 
                onClick={downloadAllAsZip}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
              >
                下载 ZIP
              </button>
            )}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">参数调节面板</h3>
              </div>
              <WatermarkControls settings={settings} onUpdate={setSettings} />
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6">
              <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                回写功能已支持
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                选择“保存目录”后，处理后的图片将直接生成到该目录下。如果未选择，则可手动下载 ZIP 包。
              </p>
            </div>
          </aside>

          <section className="lg:col-span-8 space-y-8">
            {files.length === 0 ? (
              <div className="h-[600px] bg-[#0a0a0a] border-2 border-dashed border-white/5 rounded-[4rem] flex items-center justify-center p-12 transition-all hover:border-blue-500/20 group relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <FileUploader onFilesSelected={handleFilesSelected} />
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                <ProcessingStatus stats={stats} isProcessing={isProcessing} />
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2">实时画布预览</h4>
                    <PreviewSection file={files[0]} settings={settings} />
                  </div>
                  
                  <div className="flex flex-col h-[520px]">
                    <div className="flex justify-between items-center mb-4 px-2">
                      <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">待处理队列 ({files.length})</h4>
                      <FileUploader onFilesSelected={handleFilesSelected} compact />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {files.map((f) => (
                        <div key={f.id} className={`flex items-center gap-4 p-3.5 rounded-[1.25rem] border transition-all ${f.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#0a0a0a] border-white/5'}`}>
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                            <img src={f.previewUrl} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-black truncate text-slate-200 uppercase tracking-tighter">{f.name}</div>
                            <div className="text-[10px] text-slate-600 mt-1 font-mono uppercase tracking-tight">{(f.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-2">
                            {f.status === 'processing' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                            {f.status === 'completed' && <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
