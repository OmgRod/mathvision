import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, LineChart } from 'lucide-react';
import { motion } from 'motion/react';
import { create, all } from 'mathjs';

const math = create(all);

export const CalculatorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<'scientific' | 'graphing'>('scientific');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [zoom, setZoom] = useState(10);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  const [isShift, setIsShift] = useState(false);
  const [isHyp, setIsHyp] = useState(false);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleEvaluate = () => {
    try {
      if (!expression.trim()) {
        setResult('');
        return;
      }

      let scope: any = {};
      if (angleMode === 'deg') {
        scope = {
          sin: math.evaluate('f(x) = sin(x deg)'),
          cos: math.evaluate('f(x) = cos(x deg)'),
          tan: math.evaluate('f(x) = tan(x deg)'),
          asin: math.evaluate('f(x) = asin(x) / deg'),
          acos: math.evaluate('f(x) = acos(x) / deg'),
          atan: math.evaluate('f(x) = atan(x) / deg'),
        };
      }

      const res = math.evaluate(expression, scope);
      
      if (typeof res === 'function') {
        setResult('Incomplete');
        return;
      }

      if (typeof res === 'number') {
        setResult(Number(res).toPrecision(10).replace(/\.?0+$/, ''));
      } else if (res && typeof res === 'object') {
        if (res.isComplex) {
          const re = res.re.toPrecision(5).replace(/\.?0+$/, '');
          const im = res.im.toPrecision(5).replace(/\.?0+$/, '');
          const sign = res.im >= 0 ? '+' : '-';
          setResult(`${re} ${sign} ${Math.abs(res.im).toPrecision(5).replace(/\.?0+$/, '')}i`);
        } else if (res.isUnit) {
          setResult(res.toString());
        } else if (res.isMatrix) {
          setResult('Matrix');
        } else if (res.entries && Array.isArray(res.entries)) {
          setResult('Array');
        } else {
          setResult(res.toString());
        }
      } else {
        setResult(res?.toString() || '0');
      }
    } catch (e) {
      setResult('Error');
    }
  };

  useEffect(() => {
    if (mode === 'scientific') {
       handleEvaluate();
    }
  }, [expression, mode, angleMode]);

  useEffect(() => {
    if (mode === 'graphing' && canvasRef.current) {
      drawGraph();
    }
  }, [expression, mode, angleMode, zoom, offset]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const xMin = -zoom + offset.x;
    const xMax = zoom + offset.x;
    const yMin = -zoom + offset.y;
    const yMax = zoom + offset.y;
    
    const scaleX = width / (xMax - xMin);
    const scaleY = height / (yMax - yMin);
    
    const originX = width / 2 - (offset.x * scaleX);
    const originY = height / 2 + (offset.y * scaleY);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const step = zoom > 50 ? 10 : (zoom > 20 ? 5 : 1);
    
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';

    for (let x = Math.ceil(xMin / step) * step; x <= xMax; x += step) {
      const screenX = originX + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();
      
      // Labels
      if (Math.abs(x) > 0.001) {
        ctx.fillText(x.toString(), screenX, originY + 15);
      }
    }
    for (let y = Math.ceil(yMin / step) * step; y <= yMax; y += step) {
      const screenY = originY - y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
      ctx.stroke();
      
      // Labels
      if (Math.abs(y) > 0.001) {
        ctx.textAlign = 'right';
        ctx.fillText(y.toString(), originX - 10, screenY + 4);
        ctx.textAlign = 'center';
      }
    }
    
    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY); ctx.lineTo(width, originY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(originX, 0); ctx.lineTo(originX, height);
    ctx.stroke();

    if (!expression.trim()) return;

    // Handle Equations (implicit or explicit)
    let processedExpression = expression.replace(/\s+/g, '');
    let isImplicit = processedExpression.includes('=');
    let finalExpr = processedExpression;

    if (isImplicit) {
      const sides = processedExpression.split('=');
      if (sides[0] === 'y') {
        finalExpr = sides[1];
        isImplicit = false;
      } else if (sides[0] === 'x') {
        // Vertical line x = c
        const c = parseFloat(sides[1]);
        if (!isNaN(c)) {
          const sx = originX + c * scaleX;
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, height);
          ctx.stroke();
          return;
        }
        finalExpr = `x - (${sides[1]})`;
        isImplicit = true;
      } else {
        finalExpr = `(${sides[0]}) - (${sides[1]})`;
        isImplicit = true;
      }
    }

    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    
    let scope: any = {};
    if (angleMode === 'deg') {
      scope = {
        sin: (x: any) => math.sin(x * Math.PI / 180),
        cos: (x: any) => math.cos(x * Math.PI / 180),
        tan: (x: any) => math.tan(x * Math.PI / 180),
      };
    }

    try {
      const compiled = math.compile(finalExpr);
      
      if (!isImplicit) {
        // Standard f(x) rendering
        ctx.beginPath();
        let isFirst = true;
        for (let px = 0; px <= width; px += 2) {
          const mathX = xMin + (px / width) * (xMax - xMin);
          scope.x = mathX;
          const mathY = compiled.evaluate(scope);
          if (typeof mathY === 'number' && isFinite(mathY)) {
            const py = originY - mathY * scaleY;
            if (isFirst) { ctx.moveTo(px, py); isFirst = false; }
            else { ctx.lineTo(px, py); }
          } else { isFirst = true; }
        }
        ctx.stroke();
      } else {
        // Implicit rendering using a grid of points
        const gridSize = 150;
        const dx = (xMax - xMin) / gridSize;
        const dy = (yMax - yMin) / gridSize;
        
        ctx.fillStyle = '#818cf8';
        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            const x = xMin + i * dx;
            const y = yMin + j * dy;
            
            try {
              // Check corners for sign change
              const v1 = compiled.evaluate({ ...scope, x, y });
              const v2 = compiled.evaluate({ ...scope, x: x + dx, y });
              const v3 = compiled.evaluate({ ...scope, x, y: y + dy });
              const v4 = compiled.evaluate({ ...scope, x: x + dx, y: y + dy });
              
              if ((v1 * v2 <= 0) || (v1 * v3 <= 0) || (v1 * v4 <= 0) || (v2 * v4 <= 0) || (v3 * v4 <= 0)) {
                 const sx = originX + x * scaleX;
                 const sy = originY - y * scaleY;
                 ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
              }
            } catch(e) {}
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'graphing') return;
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || mode !== 'graphing') return;
    
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const unitsPerPixelX = (zoom * 2) / canvas.width;
      const unitsPerPixelY = (zoom * 2) / canvas.height;
      
      setOffset(prev => ({
        x: prev.x - dx * unitsPerPixelX,
        y: prev.y + dy * unitsPerPixelY
      }));
    }
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleButton = (val: string) => {
    if (val === 'DEL') {
      setExpression(prev => prev.slice(0, -1));
    } else {
      setExpression(prev => prev + val);
    }
    if (isShift) setIsShift(false);
  };

  const Btn = ({ 
    label, shiftLabel, val, shiftVal, className = "", isFunc = false 
  }: { 
    label: string, shiftLabel?: string, val: string, shiftVal?: string, className?: string, isFunc?: boolean 
  }) => {
    const currentLabel = isShift && shiftLabel ? shiftLabel : label;
    const currentVal = isShift && shiftVal !== undefined ? shiftVal : val;
    
    const baseClass = isFunc 
      ? "p-2 bg-slate-800 text-slate-300 rounded-lg font-bold text-xs hover:bg-slate-700 border-b-2 border-slate-900 active:border-b-0 active:translate-y-[2px] transition-all flex flex-col items-center justify-center relative overflow-hidden" 
      : "p-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-600 border-b-4 border-slate-200 dark:border-slate-800 active:border-b-0 active:translate-y-[4px] transition-all";
      
    return (
      <button 
        onClick={() => handleButton(currentVal)} 
        className={`${baseClass} ${className}`}
      >
        {isFunc && shiftLabel && !isShift && (
          <span className="absolute top-0.5 left-1 text-[8px] text-amber-500">{shiftLabel}</span>
        )}
        <span className={isFunc && isShift && shiftLabel ? "text-amber-500" : ""}>{currentLabel}</span>
      </button>
    );
  };

  const TrigBtn = ({ name }: { name: string }) => {
    const prefix = isHyp ? name + 'h' : name;
    const label = prefix;
    const shiftLabel = prefix + '⁻¹';
    const val = prefix + '(';
    const shiftVal = 'a' + prefix + '(';
    return <Btn label={label} shiftLabel={shiftLabel} val={val} shiftVal={shiftVal} isFunc />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 w-full max-w-[420px] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-700 flex flex-col font-sans"
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => { setMode('scientific'); setExpression(''); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs transition-colors ${mode === 'scientific' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Calculator size={14} /> Scientific
            </button>
            <button 
               onClick={() => { setMode('graphing'); setExpression('sin(x)'); setResult(null); }}
               className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs transition-colors ${mode === 'graphing' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LineChart size={14} /> Graphing
            </button>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-800 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex-grow flex flex-col gap-4">
          {mode === 'scientific' ? (
            <>
              <div className="bg-[#9bb6b3] rounded-xl p-4 flex flex-col justify-between min-h-[120px] shadow-inner border-4 border-slate-800 relative">
                 <div className="absolute top-2 left-3 flex gap-2 text-[10px] font-bold text-[#4a5f5c]">
                   {isShift && <span>S</span>}
                   {isHyp && <span>HYP</span>}
                   <span>{angleMode.toUpperCase()}</span>
                 </div>
                 <div className="text-[#2c3d3a] font-mono text-base mt-4 break-all whitespace-pre-wrap leading-tight">{expression || '0'}</div>
                 <div className="text-3xl font-black text-[#1a2624] text-right font-mono tracking-tighter">
                   {result !== null && result !== 'NaN' && result !== 'Infinity' ? result : (expression ? '' : '0')}
                 </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2 mt-2">
                 <button onClick={() => setIsShift(!isShift)} className={`p-2 rounded-lg font-bold text-xs border-b-2 transition-all ${isShift ? 'bg-amber-500 text-slate-900 border-amber-600' : 'bg-slate-700 text-slate-300 border-slate-800 hover:bg-slate-600'}`}>SHIFT</button>
                 <button onClick={() => setAngleMode(prev => prev === 'deg' ? 'rad' : 'deg')} className="p-2 bg-slate-700 text-slate-300 rounded-lg font-bold text-xs border-b-2 border-slate-800 hover:bg-slate-600">{angleMode === 'deg' ? 'RAD' : 'DEG'}</button>
                 <button onClick={() => setIsHyp(!isHyp)} className={`p-2 rounded-lg font-bold text-xs border-b-2 transition-all ${isHyp ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-slate-700 text-slate-300 border-slate-800 hover:bg-slate-600'}`}>hyp</button>
                 <Btn label="x⁻¹" shiftLabel="x!" val="^-1" shiftVal="!" isFunc />
                 <Btn label="x²" shiftLabel="x³" val="^2" shiftVal="^3" isFunc />
                 
                 <Btn label="^" shiftLabel="ˣ√" val="^" shiftVal="nthRoot(" isFunc />
                 <Btn label="√" shiftLabel="³√" val="sqrt(" shiftVal="cbrt(" isFunc />
                 <Btn label="log" shiftLabel="10ˣ" val="log10(" shiftVal="10^" isFunc />
                 <Btn label="ln" shiftLabel="eˣ" val="log(" shiftVal="e^" isFunc />
                 <Btn label="|x|" shiftLabel="abs" val="abs(" isFunc />
                 
                 <Btn label="nCr" shiftLabel="nPr" val="combinations(" shiftVal="permutations(" isFunc />
                 <TrigBtn name="sin" />
                 <TrigBtn name="cos" />
                 <TrigBtn name="tan" />
                 <Btn label="π" shiftLabel="e" val="pi" shiftVal="e" isFunc />
              </div>

              <div className="grid grid-cols-5 gap-2 mt-2">
                 <Btn label="7" val="7" className="bg-white text-slate-900" />
                 <Btn label="8" val="8" className="bg-white text-slate-900" />
                 <Btn label="9" val="9" className="bg-white text-slate-900" />
                 <Btn label="DEL" val="DEL" className="bg-rose-500 text-white border-rose-700 hover:bg-rose-600" />
                 <button onClick={() => {setExpression(''); setResult(null); setIsShift(false); setIsHyp(false);}} className="p-3 bg-rose-500 text-white rounded-xl font-black text-sm hover:bg-rose-600 border-b-4 border-rose-700 active:border-b-0 active:translate-y-[4px] transition-all">AC</button>
                 
                 <Btn label="4" val="4" className="bg-white text-slate-900" />
                 <Btn label="5" val="5" className="bg-white text-slate-900" />
                 <Btn label="6" val="6" className="bg-white text-slate-900" />
                 <Btn label="×" val="*" className="bg-slate-300 text-slate-900" />
                 <Btn label="÷" val="/" className="bg-slate-300 text-slate-900" />

                 <Btn label="1" val="1" className="bg-white text-slate-900" />
                 <Btn label="2" val="2" className="bg-white text-slate-900" />
                 <Btn label="3" val="3" className="bg-white text-slate-900" />
                 <Btn label="+" val="+" className="bg-slate-300 text-slate-900" />
                 <Btn label="-" val="-" className="bg-slate-300 text-slate-900" />

                 <Btn label="0" val="0" className="bg-white text-slate-900" />
                 <Btn label="." val="." className="bg-white text-slate-900" />
                 <Btn label="EXP" val="E" className="bg-slate-300 text-slate-900 text-xs" />
                 <Btn label="(" val="(" className="bg-slate-300 text-slate-900" />
                 <Btn label=")" val=")" className="bg-slate-300 text-slate-900" />
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={expression} 
                  onChange={(e) => setExpression(e.target.value)}
                  className="flex-grow p-3 bg-slate-800 border-2 border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-mono text-white"
                  placeholder="e.g. y = sin(x) or x^2 + y^2 = 25"
                />
              </div>
              <div className="relative w-full aspect-square bg-slate-900 rounded-2xl border-2 border-slate-700 overflow-hidden">
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                  <button 
                    onClick={() => setZoom(prev => Math.max(1, prev - 2))}
                    className="w-10 h-10 bg-slate-800/80 backdrop-blur-sm text-white rounded-lg flex items-center justify-center hover:bg-indigo-500 transition-colors border border-slate-700 shadow-lg font-bold"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => setZoom(prev => Math.min(100, prev + 2))}
                    className="w-10 h-10 bg-slate-800/80 backdrop-blur-sm text-white rounded-lg flex items-center justify-center hover:bg-indigo-500 transition-colors border border-slate-700 shadow-lg font-bold"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => { setZoom(10); setOffset({ x: 0, y: 0 }); }}
                    className="w-10 h-10 bg-slate-800/80 backdrop-blur-sm text-white rounded-lg flex items-center justify-center hover:bg-indigo-500 transition-colors border border-slate-700 shadow-lg text-[10px] font-bold"
                  >
                    RESET
                  </button>
                </div>
                <canvas 
                  ref={canvasRef}
                  width={800}
                  height={800}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`w-full h-full object-cover ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
