
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Clipboard, MousePointer2 } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (base64: string, mimeType: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onUpload(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) processFile(file);
      }
    }
  }, [onUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`
        relative border-2 rounded-xl p-12 text-center cursor-pointer transition-all duration-200
        ${isDragging ? 'border-indigo-500 bg-slate-900 scale-[1.01]' : 'border-slate-700 bg-slate-950/90 hover:border-slate-500 hover:bg-slate-900'}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-900 text-slate-200'} shadow-sm border border-slate-800 transition-colors`}>
          <Upload size={32} />
        </div>
        <div>
          <p className="text-lg font-medium text-slate-100">
            Click to upload or drag & drop
          </p>
          <p className="text-sm text-slate-400 mt-1">
            PNG, JPG, or GIF. You can also paste directly!
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          <div className="h-px w-8 bg-slate-700"></div>
          OR
          <div className="h-px w-8 bg-slate-700"></div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 text-slate-200">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
            <Clipboard size={14} />
            <span>Paste Image</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
            <MousePointer2 size={14} />
            <span>Click Select</span>
          </div>
        </div>
      </div>
    </div>
  );
};
