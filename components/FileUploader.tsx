
import React, { useRef } from 'react';

interface Props {
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
}

const FileUploader: React.FC<Props> = ({ onFilesSelected, compact }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  if (compact) {
    return (
      <div className="flex gap-2">
         <button
          onClick={() => folderInputRef.current?.click()}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 transition-colors"
          title="Add Folder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 transition-colors"
          title="Add Files"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          // @ts-ignore
          webkitdirectory=""
          directory=""
          ref={folderInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-blue-500/10 rounded-full text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Drop your images here</h3>
          <p className="text-slate-500 mt-1 max-w-xs mx-auto">
            Support individual images or entire folders for batch processing.
          </p>
        </div>
      </div>

      <div className="flex gap-4 justify-center pt-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-all"
        >
          Select Files
        </button>
        <button
          onClick={() => folderInputRef.current?.click()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-all"
        >
          Select Folder
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
        // @ts-ignore
        webkitdirectory=""
        directory=""
        ref={folderInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUploader;
