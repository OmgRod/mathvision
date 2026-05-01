import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, LineChart } from 'lucide-react';
import { motion } from 'motion/react';
import { create, all } from 'mathjs';

const math = create(all);

export const CalculatorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<'scientific' | 'graphing'>('scientific');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  
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
      if (typeof res === 'number') {
        setResult(Number(res).toPrecision(10).replace(/\.?0+$/, ''));
      } else if (res && res.isComplex) {
         setResult(`${res.re.toPrecision(5).replace(/\.?0+$/, '')} + ${res.im.toPrecision(5).replace(/\.?0+$/, '')}i`);
      } else {
        setResult(res.toString());
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
  }, [expression, mode, angleMode]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const xMin = -10;
    const xMax = 10;
    const yMin = -10;
    const yMax = 10;

    const scaleX = width / (xMax - xMin);
    const scaleY = height / (yMax - yMin);
    
    const originX = width / 2;
    const originY = height / 2;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let x = xMin; x <= xMax; x++) {
      const screenX = originX + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();
    }
    for (let y = yMin; y <= yMax; y++) {
      const screenY = originY - y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
      ctx.stroke();
    }
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    if (!expression.trim()) return;

    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    let isFirst = true;
    
    let scope: any = {};
    if (angleMode === 'deg') {
      scope = {
        sin: math.evaluate('f(x) = sin(x deg)'),
        cos: math.evaluate('f(x) = cos(x deg)'),
        tan: math.evaluate('f(x) = tan(x deg)'),
      };
    }

    let compiled: any = null;
    try {
      compiled = math.compile(expression);
    } catch (e) {
      return;
    }

    for (let px = 0; px <= width; px += 2) {
      const mathX = xMin + (px / width) * (xMax - xMin);
      try {
        scope.x = mathX;
        const mathY = compiled.evaluate(scope);
        if (typeof mathY === 'number' && !isNaN(mathY) && isFinite(mathY)) {
          const py = originY - mathY * scaleY;
          if (py < -height || py > height * 2) {
             isFirst = true;
             continue;
          }
          if (isFirst) {
            ctx.moveTo(px, py);
            isFirst = false;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          isFirst = true; 
        }
      } catch (e) {
        break; 
      }
    }
    ctx.stroke();
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
                <span className="text-xl font-black italic text-indigo-400">f(x) =</span>
                <input 
                  type="text" 
                  value={expression} 
                  onChange={(e) => setExpression(e.target.value)}
                  className="flex-grow p-3 bg-slate-800 border-2 border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-mono text-white"
                  placeholder="e.g. sin(x) + x^2"
                />
              </div>
              <div className="relative w-full aspect-square bg-slate-900 rounded-2xl border-2 border-slate-700 overflow-hidden">
                <canvas 
                  ref={canvasRef}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
