
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

  const clearAll = useCallback(() => {
    // 显式释放内存
    files.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
  }, [files]);

  const processBatch = async () => {
    if (isProcessing || files.length === 0) return;
    setIsProcessing(true);

    // 自动重置：将所有文件状态设为 pending，并清除之前的 processedBlob
    setFiles(prev => prev.map(f => {
      // 如果已经是完成状态，需要释放旧的处理后 URL（如果预览用的是处理后的图）
      return { 
        ...f, 
        status: 'pending' as const, 
        processedBlob: undefined 
      };
    }));
    
    // 延迟一小会儿确保状态更新后再处理
    await new Promise(resolve => setTimeout(resolve, 100));

    for (let i = 0; i < files.length; i++) {
      // 这里的 files 是闭包中的，我们直接用 index 操作 state
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f));
      
      try {
        const currentFile = files[i];
        const blob = await applyWatermark(currentFile.file, settings);
        const newPreviewUrl = URL.createObjectURL(blob);
        
        setFiles(prev => prev.map((f, idx) => {
          if (idx === i) {
            URL.revokeObjectURL(f.previewUrl); // 释放旧预览
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
        console.error('Processing failed:', err);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
      }
    }
    setIsProcessing(false);
  };

  const downloadAll = async () => {
    const done = files.filter(f => f.status === 'completed' && f.processedBlob);
    if (done.length === 0) return;

    const zip = new JSZip();
    done.forEach(f => zip.file(`marked_${f.name}`, f.processedBlob!));
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MarkMaster_${new Date().getTime()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 selection:bg-blue-500/30 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                MarkMaster <span className="text-blue-500 text-sm font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">PRO</span>
              </h1>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Enterprise Batch Processor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {files.length > 0 && (
              <button 
                onClick={clearAll}
                disabled={isProcessing}
                className="text-xs font-bold text-slate-500 hover:text-red-500 px-4 py-2 rounded-lg transition-all hover:bg-red-500/10 disabled:opacity-30"
              >
                清除所有任务
              </button>
            )}
            
            <button 
              onClick={processBatch}
              disabled={files.length === 0 || isProcessing}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 px-8 py-2.5 rounded-xl text-sm font-black transition-all shadow-xl shadow-blue-900/10 active:scale-95 flex items-center gap-3"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              )}
              {isProcessing ? '处理中...' : '开始生成'}
            </button>
            
            {stats.completed > 0 && (
              <button 
                onClick={downloadAll}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
              >
                打包下载 ZIP
              </button>
            )}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Settings Area */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">水印参数设置</h3>
              </div>
              <WatermarkControls settings={settings} onUpdate={setSettings} />
            </div>
            <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-blue-400 mb-2">💡 批量处理说明</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                每次点击“开始生成”都会使用当前最新的水印配置对列表内所有图片进行重新处理。
              </p>
            </div>
          </aside>

          {/* Workflow Area */}
          <section className="lg:col-span-8 space-y-8">
            {files.length === 0 ? (
              <div className="h-[600px] bg-[#0a0a0a] border-2 border-dashed border-white/5 rounded-[3rem] flex items-center justify-center p-12 transition-all hover:border-blue-500/20 group">
                <FileUploader onFilesSelected={handleFilesSelected} />
              </div>
            ) : (
              <div className="space-y-8">
                <ProcessingStatus stats={stats} isProcessing={isProcessing} />
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">实时渲染预览</h4>
                    <PreviewSection file={files[0]} settings={settings} />
                  </div>
                  
                  <div className="flex flex-col h-[520px]">
                    <div className="flex justify-between items-center mb-4 px-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">任务列表 ({files.length})</h4>
                      <FileUploader onFilesSelected={handleFilesSelected} compact />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {files.map((f) => (
                        <div key={f.id} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${f.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-white/5 border-white/5'}`}>
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/5">
                            <img src={f.previewUrl} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold truncate text-slate-200 uppercase">{f.name}</div>
                            <div className="text-[10px] text-slate-600 mt-0.5">{(f.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                          <div className="flex-shrink-0 px-2">
                            {f.status === 'processing' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                            {f.status === 'completed' && <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
                            {f.status === 'error' && <span className="text-red-500 text-[10px] font-bold">失败</span>}
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
