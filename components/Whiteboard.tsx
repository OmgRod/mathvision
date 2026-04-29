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
  ArrowRight,
  ZoomIn,
  ZoomOut
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
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

  const shapeStateRef = useRef<{
    shape: fabric.Object | null;
    startPoint: fabric.Point | null;
  }>({ shape: null, startPoint: null });

  const saveHistory = () => {
    if (fabricCanvasRef.current) {
      const json = JSON.stringify(fabricCanvasRef.current.toJSON());
      setHistory(prev => [...prev.slice(-19), json]);
    }
  };

  const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const headlen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Line
    const line = new fabric.Line([fromX, fromY, toX, toY], {
      stroke: color,
      strokeWidth: 3,
      selectable: false,
      evented: false,
    });

    // Arrow head triangle
    const arrowPoints = [
      { x: toX, y: toY },
      { x: toX - headlen * Math.cos(angle - Math.PI / 6), y: toY - headlen * Math.sin(angle - Math.PI / 6) },
      { x: toX - headlen * Math.cos(angle + Math.PI / 6), y: toY - headlen * Math.sin(angle + Math.PI / 6) },
    ];

    const arrowHead = new fabric.Polygon(
      arrowPoints.map(p => ({ x: p.x - toX, y: p.y - toY })),
      {
        left: toX,
        top: toY,
        fill: color,
        stroke: color,
        strokeWidth: 1,
        selectable: false,
        evented: false,
      }
    );

    canvas.add(line, arrowHead);
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

    // Mouse wheel zoom
    containerRef.current.addEventListener('wheel', (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.8 : 1.2;
        const newZoom = Math.max(0.5, Math.min(4, zoom * delta));
        setZoom(newZoom);
        canvas.setZoom(newZoom);
        canvas.renderAll();
      }
    });

    // Pan with space + drag
    const handlePanStart = (e: fabric.TPointerEvent) => {
      if (isPanning && tool === 'select') {
        setPanStart({ x: (e as any).pageX, y: (e as any).pageY });
      }
    };

    const handlePan = (e: fabric.TPointerEvent) => {
      if (!isPanning || !panStart) return;
      const delta = {
        x: (e as any).pageX - panStart.x,
        y: (e as any).pageY - panStart.y,
      };
      canvas.viewportTransform![4] += delta.x;
      canvas.viewportTransform![5] += delta.y;
      canvas.renderAll();
      setPanStart({ x: (e as any).pageX, y: (e as any).pageY });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanning(true);
      }
      if (e.key === '+' || e.key === '=') {
        const newZoom = Math.min(4, zoom * 1.2);
        setZoom(newZoom);
        canvas.setZoom(newZoom);
        canvas.renderAll();
      }
      if (e.key === '-') {
        const newZoom = Math.max(0.5, zoom * 0.8);
        setZoom(newZoom);
        canvas.setZoom(newZoom);
        canvas.renderAll();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanning(false);
        setPanStart(null);
      }
    };

    canvas.on('mouse:down', handlePanStart);
    canvas.on('mouse:move', handlePan);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.dispose();
    };
  }, [isPanning, panStart, zoom]);

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
        setTool('select');
      });
    } else {
      // Shape tools
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.forEachObject(obj => obj.selectable = false);

      canvas.on('mouse:down', (options: any) => {
        if (!options.pointer) return;
        const startPoint = new fabric.Point(options.pointer.x, options.pointer.y);
        shapeStateRef.current.startPoint = startPoint;
        
        let shape: fabric.Object | null = null;
        
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
        } else if (tool === 'line' || tool === 'arrow') {
          shape = new fabric.Line([startPoint.x, startPoint.y, startPoint.x, startPoint.y], {
            stroke: color,
            strokeWidth: 3,
            selectable: false,
          });
        }

        if (shape) {
          canvas.add(shape);
          shapeStateRef.current.shape = shape;
        }
      });

      canvas.on('mouse:move', (options: any) => {
        const { shape, startPoint } = shapeStateRef.current;
        if (!shape || !startPoint || !options.pointer) return;
        
        const pointer = options.pointer;
        
        if (tool === 'rect') {
          const width = Math.abs(pointer.x - startPoint.x);
          const height = Math.abs(pointer.y - startPoint.y);
          (shape as fabric.Rect).set({
            width,
            height,
            left: Math.min(startPoint.x, pointer.x),
            top: Math.min(startPoint.y, pointer.y),
          });
        } else if (tool === 'circle') {
          const radius = Math.sqrt(Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2));
          (shape as fabric.Circle).set({
            radius,
            left: Math.min(startPoint.x, pointer.x),
            top: Math.min(startPoint.y, pointer.y),
          });
        } else if (tool === 'line') {
          (shape as fabric.Line).set({
            x2: pointer.x,
            y2: pointer.y,
          });
        } else if (tool === 'arrow') {
          (shape as fabric.Line).set({
            x2: pointer.x,
            y2: pointer.y,
          });
        }
        
        canvas.renderAll();
      });

      canvas.on('mouse:up', () => {
        // For arrow, we need to redraw with arrowhead
        if (tool === 'arrow' && shapeStateRef.current.shape && shapeStateRef.current.startPoint) {
          const line = shapeStateRef.current.shape as fabric.Line;
          const start = shapeStateRef.current.startPoint;
          canvas.remove(line);
          drawArrow(start.x, start.y, line.x2 || start.x, line.y2 || start.y, color);
        }
        
        saveHistory();
        shapeStateRef.current.shape = null;
        shapeStateRef.current.startPoint = null;
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
      
      fabricCanvasRef.current.loadFromJSON(JSON.parse(lastState), () => {
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

  const handleZoom = (direction: 'in' | 'out') => {
    const delta = direction === 'in' ? 1.2 : 0.8;
    const newZoom = Math.max(0.5, Math.min(4, zoom * delta));
    setZoom(newZoom);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(newZoom);
      fabricCanvasRef.current.renderAll();
    }
  };

  const resetZoom = () => {
    setZoom(1);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(1);
      fabricCanvasRef.current.viewportTransform = [1, 0, 0, 1, 0, 0];
      fabricCanvasRef.current.renderAll();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-[90vw] md:w-[700px] h-auto'}`}
    >
      <div className="flex items-center justify-between p-4 bg-slate-900 dark:bg-slate-950 text-white cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
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
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={<MousePointer2 size={18} />} title="Select (Space to pan)" />
              <ToolButton active={tool === 'pencil'} onClick={() => setTool('pencil')} icon={<Pencil size={18} />} title="Pencil" />
              <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={<Eraser size={18} />} title="Eraser" />
              <ToolButton active={tool === 'text'} onClick={() => setTool('text')} icon={<Type size={18} />} title="Text" />
              <ToolButton active={tool === 'rect'} onClick={() => setTool('rect')} icon={<Square size={18} />} title="Rectangle" />
              <ToolButton active={tool === 'circle'} onClick={() => setTool('circle')} icon={<Circle size={18} />} title="Circle" />
              <ToolButton active={tool === 'line'} onClick={() => setTool('line')} icon={<Minus size={18} />} title="Line" />
              <ToolButton active={tool === 'arrow'} onClick={() => setTool('arrow')} icon={<ArrowRight size={18} />} title="Arrow" />
            </div>

            <div className="flex items-center gap-2 px-2 border-l border-slate-200 dark:border-slate-700">
               {['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#000000', '#ffffff'].map(c => (
                 <button
                   key={c}
                   onClick={() => setColor(c)}
                   className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-400 dark:border-slate-500 scale-125' : 'border-transparent'} ${c === '#ffffff' ? 'border-slate-200 dark:border-slate-700' : ''}`}
                   style={{ backgroundColor: c }}
                   title={`Color: ${c}`}
                 />
               ))}
            </div>

            <div className="flex ml-auto gap-2">
              <ToolButton onClick={() => handleZoom('out')} icon={<ZoomOut size={18} />} title={`Zoom out (Current: ${Math.round(zoom * 100)}%)`} />
              <ToolButton 
                onClick={resetZoom}
                className={zoom === 1 ? 'opacity-50' : ''}
                icon={<span className="text-xs font-bold">{Math.round(zoom * 100)}%</span>}
                title="Reset zoom"
              />
              <ToolButton onClick={() => handleZoom('in')} icon={<ZoomIn size={18} />} title="Zoom in" />
              <ToolButton onClick={undo} icon={<Undo size={18} />} disabled={history.length === 0} title="Undo" />
              <ToolButton onClick={deleteSelected} icon={<X size={18} />} className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10" title="Delete selected" />
              <ToolButton onClick={clearCanvas} icon={<Trash2 size={18} />} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10" title="Clear canvas" />
              <ToolButton onClick={downloadCanvas} icon={<Download size={18} />} title="Download as PNG" />
            </div>
          </div>

          <div ref={containerRef} className="border-2 border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 relative cursor-crosshair">
            <canvas ref={canvasRef} className={isPanning ? 'cursor-grab' : ''} />
            <div className="absolute top-2 left-2 px-2 py-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg text-[10px] font-bold text-slate-400 dark:text-slate-500 pointer-events-none">
              {tool.toUpperCase()} • {zoom.toFixed(1)}x {isPanning && '• PANNING'}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            💡 <b>Zoom:</b> Scroll + Ctrl | <b>Pan:</b> Hold Space + Drag | <b>Shape Tools:</b> Click & drag to draw
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
  title?: string;
}> = ({ active, onClick, icon, className = "", disabled, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2.5 rounded-lg transition-all ${active ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${className}`}
  >
    {icon}
  </button>
);
