
import React, { useRef } from 'react';

interface Props {
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
}

const FileUploader: React.FC<Props> = ({ onFilesSelected, compact }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = ''; // Reset to allow re-selection
    }
  };

  const triggerFiles = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const triggerFolder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    folderInputRef.current?.click();
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={triggerFolder}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 transition-colors cursor-pointer"
          title="添加文件夹"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={triggerFiles}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 transition-colors cursor-pointer"
          title="添加图片"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={folderInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          multiple 
          {...({ webkitdirectory: "", directory: "" } as any)} 
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center space-y-10 relative z-50">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 bg-blue-600/10 rounded-[2rem] border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-white tracking-tight">批量导入任务</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed font-medium">
            支持选择数千张图片或直接遍历整个本地文件夹进行水印处理。
          </p>
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <button
          type="button"
          onClick={triggerFiles}
          className="flex-1 px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-white/5 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          选择图片
        </button>
        <button
          type="button"
          onClick={triggerFolder}
          className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/30 active:scale-95 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
          选择整个文件夹
        </button>
      </div>

      <input 
        type="file" 
        multiple 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={folderInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        multiple 
        {...({ webkitdirectory: "", directory: "" } as any)} 
      />
    </div>
  );
};

export default FileUploader;
