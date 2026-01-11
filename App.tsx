
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
    // 释放所有预览和处理后的 URL
    files.forEach(f => {
      URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
  }, [files]);

  const processBatch = async () => {
    if (isProcessing || files.length === 0) return;
    setIsProcessing(true);

    // 自动清除之前的执行状态，开始新的生成
    const freshFiles = files.map(f => ({
      ...f,
      status: 'pending' as const,
      processedBlob: undefined
    }));
    setFiles(freshFiles);
    
    // 按顺序处理
    for (let i = 0; i < freshFiles.length; i++) {
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f));
      
      try {
        const blob = await applyWatermark(freshFiles[i].file, settings);
        const newPreviewUrl = URL.createObjectURL(blob);
        
        setFiles(prev => prev.map((f, idx) => {
          if (idx === i) {
            // 不再需要旧的预览图
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
        console.error('Processing failed for', freshFiles[i].name, err);
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
    a.download = `MarkMaster_Batch_${new Date().getTime()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 selection:bg-blue-500/30 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Top Navbar */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                MarkMaster <span className="text-blue-500 text-sm font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">PRO</span>
              </h1>
              <p className="text-slate-500 text-xs font-medium">企业级本地化批量水印工具</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {files.length > 0 && (
              <button 
                onClick={clearAll}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-95 disabled:opacity-50"
              >
                清除任务
              </button>
            )}

            <button 
              onClick={processBatch}
              disabled={files.length === 0 || isProcessing}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-xl shadow-blue-900/10 active:scale-95 flex items-center gap-2"
            >
              {isProcessing && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {isProcessing ? '处理中...' : '开始批量执行'}
            </button>
            
            {stats.completed > 0 && (
              <button 
                onClick={downloadAll}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
              >
                打包下载 ({stats.completed})
              </button>
            )}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">配置面板</h3>
              </div>
              <WatermarkControls settings={settings} onUpdate={setSettings} />
            </div>

            <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-blue-400 mb-2">💡 操作提示</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                点击“开始批量执行”时会自动重置之前的结果并按当前配置重新生成。支持多选位置，水印将同时渲染在所有选定区域。
              </p>
            </div>
          </aside>

          <section className="lg:col-span-8 space-y-8">
            {files.length === 0 ? (
              <div className="h-[500px] md:h-[600px] bg-[#0a0a0a] border-2 border-dashed border-white/10 rounded-[3rem] flex items-center justify-center p-6 transition-colors hover:border-blue-500/20 group relative overflow-hidden">
                <FileUploader onFilesSelected={handleFilesSelected} />
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-700">
                <ProcessingStatus stats={stats} isProcessing={isProcessing} />
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">效果预览 (当前配置)</h4>
                    <PreviewSection file={files[0]} settings={settings} />
                  </div>
                  
                  <div className="flex flex-col h-[520px]">
                    <div className="flex justify-between items-center mb-4 px-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">待处理列表 ({files.length})</h4>
                      <FileUploader onFilesSelected={handleFilesSelected} compact />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {files.map((f) => (
                        <div key={f.id} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${f.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'bg-white/5 border-white/5'}`}>
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                            <img src={f.previewUrl} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold truncate text-slate-300 uppercase">{f.name}</div>
                            <div className="text-[9px] text-slate-600 mt-0.5 font-mono">{(f.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-2">
                            {f.status === 'processing' && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                            {f.status === 'completed' && <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
                            {f.status === 'error' && <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>}
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
