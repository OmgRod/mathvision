
import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraInputProps {
  onCapture: (base64: string, mimeType: string) => void;
  onClose: () => void;
}

export const CameraInput: React.FC<CameraInputProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage, 'image/jpeg');
      onClose();
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
      >
        <X size={24} />
      </button>

      <div className="relative w-full max-w-md aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-white/20 pointer-events-none m-8 rounded-2xl"></div>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button 
                onClick={capture}
                className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 active:scale-95 transition-transform flex items-center justify-center"
              >
                <div className="w-12 h-12 bg-white rounded-full border-2 border-slate-900"></div>
              </button>
            </div>
          </>
        ) : (
          <>
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
              <button 
                onClick={retake}
                className="w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Retake"
              >
                <RefreshCw size={24} />
              </button>
              <button 
                onClick={confirm}
                className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-colors"
                title="Confirm"
              >
                <Check size={24} />
              </button>
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      
      <div className="mt-8 text-white/60 text-sm flex items-center gap-2">
        <Camera size={16} />
        <span>Position the equation clearly in the frame</span>
      </div>
    </div>
  );
};
