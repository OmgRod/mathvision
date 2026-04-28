import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { 
  Pencil, 
  Eraser, 
  Trash2, 
  Undo, 
  Square, 
  Circle, 
  Minus,
  Maximize2,
  Minimize2,
  Download,
  X,
  PenTool,
  MousePointer2,
  Type,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WhiteboardProps {
  onClose?: () => void;
  title?: string;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ onClose, title = "Scratchpad" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [tool, setTool] = useState<'select' | 'pencil' | 'eraser' | 'rect' | 'circle' | 'line' | 'text' | 'arrow'>('pencil');
  const [color, setColor] = useState('#4f46e5');
  const [isMinimized, setIsMinimized] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const saveHistory = () => {
    if (fabricCanvasRef.current) {
      const json = JSON.stringify(fabricCanvasRef.current.toJSON());
      setHistory(prev => [...prev.slice(-19), json]); // Keep last 20 steps
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: containerRef.current.clientWidth,
      height: 400,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;
    
    canvas.on('path:created', () => {
      saveHistory();
    });

    canvas.on('object:modified', () => {
      saveHistory();
    });
    
    // Set initial pen
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = color;

    const handleResize = () => {
      if (containerRef.current && fabricCanvasRef.current) {
        fabricCanvasRef.current.setDimensions({
          width: containerRef.current.clientWidth,
          height: 400,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    if (tool === 'pencil') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 3;
      canvas.freeDrawingBrush.color = color;
      canvas.selection = false;
      canvas.forEachObject(obj => obj.selectable = false);
    } else if (tool === 'eraser') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 20;
      canvas.freeDrawingBrush.color = '#ffffff';
      canvas.selection = false;
      canvas.forEachObject(obj => obj.selectable = false);
    } else if (tool === 'select') {
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.forEachObject(obj => obj.selectable = true);
    } else if (tool === 'text') {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.forEachObject(obj => obj.selectable = false);
      
      canvas.on('mouse:down', (options: any) => {
        if (!options.pointer || tool !== 'text') return;
        const text = new fabric.IText('Type here...', {
          left: options.pointer.x,
          top: options.pointer.y,
          fontFamily: 'Inter',
          fontSize: 20,
          fill: color,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        setTool('select'); // Switch to select after adding text
      });
    } else {
      // Shape tools
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.forEachObject(obj => obj.selectable = false);

      let shape: fabric.Object | null = null;
      let startPoint: fabric.Point | null = null;

      canvas.on('mouse:down', (options: any) => {
        if (!options.pointer) return;
        startPoint = new fabric.Point(options.pointer.x, options.pointer.y);
        
        if (tool === 'rect') {
          shape = new fabric.Rect({
            left: startPoint.x,
            top: startPoint.y,
            width: 0,
            height: 0,
            fill: 'transparent',
            stroke: color,
            strokeWidth: 3,
            selectable: false,
          });
        } else if (tool === 'circle') {
          shape = new fabric.Circle({
            left: startPoint.x,
            top: startPoint.y,
            radius: 0,
            fill: 'transparent',
            stroke: color,
            strokeWidth: 3,
            selectable: false,
          });
        } else if (tool === 'line') {
          shape = new fabric.Line([startPoint.x, startPoint.y, startPoint.x, startPoint.y], {
            stroke: color,
            strokeWidth: 3,
            selectable: false,
          });
        } else if (tool === 'arrow') {
          // Arrow is a group of line and triangle
          shape = new fabric.Line([startPoint.x, startPoint.y, startPoint.x, startPoint.y], {
            stroke: color,
            strokeWidth: 3,
            originX: 'center',
            originY: 'center',
            selectable: false,
          });
        }

        if (shape) canvas.add(shape);
      });

      canvas.on('mouse:move', (options: any) => {
        if (!shape || !startPoint || !options.pointer) return;
        
        const pointer = options.pointer;
        if (tool === 'rect') {
          (shape as fabric.Rect).set({
            width: Math.abs(startPoint.x - pointer.x),
            height: Math.abs(startPoint.y - pointer.y),
          });
          if (pointer.x < startPoint.x) shape.set({ left: pointer.x });
          if (pointer.y < startPoint.y) shape.set({ top: pointer.y });
        } else if (tool === 'circle') {
          const radius = Math.sqrt(Math.pow(startPoint.x - pointer.x, 2) + Math.pow(startPoint.y - pointer.y, 2)) / 2;
          (shape as fabric.Circle).set({
            radius: radius,
            left: Math.min(startPoint.x, pointer.x),
            top: Math.min(startPoint.y, pointer.y),
          });
        } else if (tool === 'line' || tool === 'arrow') {
          (shape as fabric.Line).set({
            x2: pointer.x,
            y2: pointer.y,
          });
        }
        
        canvas.renderAll();
      });

      canvas.on('mouse:up', () => {
        saveHistory();
        shape = null;
        startPoint = null;
      });
    }
  }, [tool, color]);

  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      saveHistory();
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = '#ffffff';
      fabricCanvasRef.current.renderAll();
    }
  };

  const undo = () => {
    if (fabricCanvasRef.current && history.length > 0) {
      const lastState = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      
      fabricCanvasRef.current.loadFromJSON(JSON.parse(lastState)).then(() => {
        fabricCanvasRef.current?.renderAll();
      });
    }
  };

  const deleteSelected = () => {
    if (fabricCanvasRef.current) {
      const activeObjects = fabricCanvasRef.current.getActiveObjects();
      if (activeObjects.length > 0) {
        saveHistory();
        activeObjects.forEach(obj => fabricCanvasRef.current?.remove(obj));
        fabricCanvasRef.current.discardActiveObject();
        fabricCanvasRef.current.renderAll();
      }
    }
  };

  const downloadCanvas = () => {
    if (fabricCanvasRef.current) {
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
      } as any);
      const link = document.createElement('a');
      link.download = 'whiteboard.png';
      link.href = dataURL;
      link.click();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-6 right-6 z-50 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden w-[90vw] md:w-[600px] transition-all duration-300 ${isMinimized ? 'h-16' : 'h-auto'}`}
    >
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
             <PenTool size={18} />
          </div>
          <span className="font-black uppercase tracking-widest text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          {onClose && (
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={<MousePointer2 size={18} />} />
              <ToolButton active={tool === 'pencil'} onClick={() => setTool('pencil')} icon={<Pencil size={18} />} />
              <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={<Eraser size={18} />} />
              <ToolButton active={tool === 'text'} onClick={() => setTool('text')} icon={<Type size={18} />} />
              <ToolButton active={tool === 'rect'} onClick={() => setTool('rect')} icon={<Square size={18} />} />
              <ToolButton active={tool === 'circle'} onClick={() => setTool('circle')} icon={<Circle size={18} />} />
              <ToolButton active={tool === 'line'} onClick={() => setTool('line')} icon={<Minus size={18} />} />
              <ToolButton active={tool === 'arrow'} onClick={() => setTool('arrow')} icon={<ArrowRight size={18} />} />
            </div>

            <div className="flex items-center gap-2 px-2 border-l border-slate-200">
               {['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(c => (
                 <button
                   key={c}
                   onClick={() => setColor(c)}
                   className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-400 scale-125' : 'border-transparent'}`}
                   style={{ backgroundColor: c }}
                 />
               ))}
            </div>

            <div className="flex ml-auto gap-2">
              <ToolButton onClick={undo} icon={<Undo size={18} />} disabled={history.length === 0} />
              <ToolButton onClick={deleteSelected} icon={<X size={18} />} className="text-amber-600 hover:bg-amber-50" />
              <ToolButton onClick={clearCanvas} icon={<Trash2 size={18} />} className="text-rose-500 hover:bg-rose-50" />
              <ToolButton onClick={downloadCanvas} icon={<Download size={18} />} />
            </div>
          </div>

          <div ref={containerRef} className="border-2 border-slate-100 rounded-2xl overflow-hidden bg-slate-50 relative">
            <canvas ref={canvasRef} />
            <div className="absolute top-2 right-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-[10px] font-bold text-slate-400 pointer-events-none">
                CANVAS READY
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ToolButton: React.FC<{ 
  active?: boolean; 
  onClick: () => void; 
  icon: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ active, onClick, icon, className = "", disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2.5 rounded-lg transition-all ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${className}`}
  >
    {icon}
  </button>
);
