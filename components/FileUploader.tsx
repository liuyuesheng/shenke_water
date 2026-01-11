
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
      e.target.value = ''; // 清空以允许重复选择
    }
  };

  const openFiles = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };
  
  const openFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    folderInputRef.current?.click();
  };

  if (compact) {
    return (
      <div className="flex gap-2 relative z-20">
        <button
          type="button"
          onClick={openFolder}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 transition-colors"
          title="选择文件夹"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={openFiles}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 transition-colors"
          title="添加图片"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <input type="file" ref={folderInputRef} onChange={handleFileChange} className="hidden" multiple {...({ webkitdirectory: "", directory: "" } as any)} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 relative z-20 flex flex-col items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-6 bg-blue-600/10 rounded-full text-blue-500 border border-blue-500/20">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">批量导入图片</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
            点击下方按钮选择单张图片、多张图片或直接导入整个文件夹。
          </p>
        </div>
      </div>

      <div className="flex gap-4 justify-center items-center">
        <button
          type="button"
          onClick={openFiles}
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-white/5 active:scale-95"
        >
          选择图片
        </button>
        <div className="w-px h-8 bg-white/10"></div>
        <button
          type="button"
          onClick={openFolder}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          选择文件夹
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
