
import React, { useState, useCallback, useMemo } from 'react';
import { WatermarkSettings, ImageFile, ProcessingStats } from './types';
import FileUploader from './components/FileUploader';
import WatermarkControls from './components/WatermarkControls';
import PreviewSection from './components/PreviewSection';
import ProcessingStatus from './components/ProcessingStatus';
import { applyWatermark } from './utils/imageProcessor';
import JSZip from 'https://esm.sh/jszip@3.10.1';

const DEFAULT_SETTINGS: WatermarkSettings = {
  text: '深氪旷工',
  fontSize: 40,
  color: '#ffffff',
  opacity: 0.4,
  position: 'top-bottom',
  fontFamily: 'sans-serif',
  rotation: 0,
};

const App: React.FC = () => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);

  const stats = useMemo<ProcessingStats>(() => ({
    total: files.length,
    completed: files.filter(f => f.status === 'completed').length,
    failed: files.filter(f => f.status === 'error').length,
  }), [files]);

  const handleFilesSelected = (newFiles: File[]) => {
    const formattedFiles: ImageFile[] = newFiles
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        status: 'pending',
        previewUrl: URL.createObjectURL(file),
      }));
    setFiles(prev => [...prev, ...formattedFiles]);
  };

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wm_${fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = async () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.processedBlob);
    if (completedFiles.length === 0) return;

    const zip = new JSZip();
    completedFiles.forEach(file => {
      zip.file(`wm_${file.name}`, file.processedBlob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `深氪旷工_水印图片_${new Date().getTime()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleProcessAll = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === 'completed') continue;

      try {
        setFiles(prev => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'processing' };
          return next;
        });

        const resultBlob = await applyWatermark(updatedFiles[i].file, settings);
        
        setFiles(prev => {
          const next = [...prev];
          next[i] = { 
            ...next[i], 
            status: 'completed', 
            processedBlob: resultBlob,
            previewUrl: URL.createObjectURL(resultBlob) 
          };
          return next;
        });
      } catch (error) {
        console.error(`Error processing ${updatedFiles[i].name}:`, error);
        setFiles(prev => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'error' };
          return next;
        });
      }
    }
    setIsProcessing(false);
  };

  const clearFiles = () => {
    files.forEach(f => {
      URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            深氪旷工 - 批量水印
          </h1>
          <p className="text-slate-400 mt-1">高效、纯净的批量图片处理工具</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {files.length > 0 && (
            <>
              <button
                onClick={clearFiles}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                清空列表
              </button>
              {stats.completed > 0 && (
                <button
                  onClick={handleDownloadAllZip}
                  className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  一键打包下载全部 ({stats.completed})
                </button>
              )}
            </>
          )}
          <button
            onClick={handleProcessAll}
            disabled={isProcessing || files.length === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                处理中...
              </>
            ) : (
              '执行批量处理'
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Config */}
        <div className="lg:col-span-4 space-y-8 sticky top-8">
          <section className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              水印配置
            </h2>
            <WatermarkControls settings={settings} onUpdate={setSettings} />
          </section>

          <section className="bg-slate-800/20 p-6 rounded-2xl border border-dashed border-slate-700 text-slate-500 text-sm">
            <p>💡 提示：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>处理完成后，点击顶部的“一键打包下载”可获得 ZIP 压缩包。</li>
              <li>支持批量拖入整个文件夹。</li>
              <li>图片处理完全在本地浏览器完成，不会上传到服务器。</li>
            </ul>
          </section>
        </div>

        {/* Right Column: Files and Preview */}
        <div className="lg:col-span-8 space-y-8">
          {files.length === 0 ? (
            <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-3xl p-12 flex flex-col items-center text-center">
              <FileUploader onFilesSelected={handleFilesSelected} />
            </div>
          ) : (
            <>
              <ProcessingStatus stats={stats} isProcessing={isProcessing} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 overflow-hidden">
                  <h2 className="text-lg font-semibold mb-4">效果预览</h2>
                  <PreviewSection file={files[0]} settings={settings} />
                </section>

                <section className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-[500px]">
                  <h2 className="text-lg font-semibold mb-4 flex justify-between items-center">
                    列表 ({files.length})
                    <FileUploader onFilesSelected={handleFilesSelected} compact />
                  </h2>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {files.map((file) => (
                      <div 
                        key={file.id} 
                        className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:bg-slate-900 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded bg-slate-800 flex-shrink-0 overflow-hidden">
                          <img src={file.previewUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.status === 'completed' && (
                            <button
                              onClick={() => file.processedBlob && downloadFile(file.processedBlob, file.name)}
                              className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          )}
                          {file.status === 'processing' && (
                            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                          )}
                          {file.status === 'error' && (
                            <span className="p-1 rounded-full bg-red-500/20 text-red-500 text-xs font-bold">!</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
