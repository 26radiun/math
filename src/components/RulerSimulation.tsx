import React, { useState, useEffect, useRef } from 'react';
import { playSnapSound, playClickSound, playSuccessChime, playClearSound, playPopSound } from '../utils/audio';
import { Check, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PIXELS_PER_CM = 38; // slightly larger for clean single view visibility
const MAX_RULER_CM = 15;
const tickMultiplier = PIXELS_PER_CM;
const rulerWidthPx = MAX_RULER_CM * tickMultiplier;

// Start position of the object relative to the stage
const objectStartLeft = 100;

const APPLE_COLORS = [
  '#FF453A', // Red
  '#FF9F0A', // Orange
  '#FFD60A', // Yellow
  '#30D158', // Green
  '#0A84FF', // Blue
  '#BF5AF2', // Purple
  '#FF6482', // Pink
];

const SIMPLE_ITEMS = [
  { emoji: '✏️', name: '크레파스' },
  { emoji: '🐛', name: '애벌레' },
  { emoji: '🍭', name: '막대사탕' },
  { emoji: '🔑', name: '황금열쇠' },
  { emoji: '🚗', name: '장난감차' },
  { emoji: '🍬', name: '알사탕' },
  { emoji: '🍌', name: '바나나' },
  { emoji: '🥕', name: '당근' },
  { emoji: '🍦', name: '아이스크림' },
  { emoji: '🍪', name: '쿠키' },
  { emoji: '🐳', name: '아기고래' },
  { emoji: '🐤', name: '오리인형' },
  { emoji: '🍁', name: '단풍잎' }
];

interface GeneratedObject {
  emoji: string;
  name: string;
  lengthCm: number;
  color: string;
}

export default function RulerSimulation() {
  const [currentObject, setCurrentObject] = useState<GeneratedObject | null>(null);
  const [rulerX, setRulerX] = useState<number>(30); 
  const [isSnapped, setIsSnapped] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'IDLE' | 'CORRECT' | 'WRONG_ALIGN' | 'WRONG_VALUE'>('IDLE');

  // The perfect ruler position for 0 alignment. 
  // Ruler has 20px of left safety padding before 0 mark exists.
  // Perfectly aligned rulerX: objectStartLeft - 20 = 80px.
  const idealRulerX = objectStartLeft - 20;

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragStartRulerX = useRef<number>(0);

  const createNewRound = () => {
    const item = SIMPLE_ITEMS[Math.floor(Math.random() * SIMPLE_ITEMS.length)];
    const randomLength = Math.floor(Math.random() * 11) + 4; // 4cm ~ 14cm
    const color = APPLE_COLORS[Math.floor(Math.random() * APPLE_COLORS.length)];

    setCurrentObject({
      emoji: item.emoji,
      name: item.name,
      lengthCm: randomLength,
      color: color
    });

    // Start with a slight random offset so they practice dragging
    let startX = Math.floor(Math.random() * 100) - 10;
    if (Math.abs(startX - idealRulerX) < 10) {
      startX += 25;
    }
    setRulerX(startX);
    setIsSnapped(false);
    setSelectedAnswer(null);
    setFeedback('IDLE');
    playPopSound();
  };

  useEffect(() => {
    createNewRound();
  }, []);

  // Snapping logic
  useEffect(() => {
    const diff = Math.abs(rulerX - idealRulerX);
    if (diff < 8) {
      if (!isSnapped) {
        setRulerX(idealRulerX);
        setIsSnapped(true);
        playSnapSound();
      }
    } else {
      if (isSnapped) {
        setIsSnapped(false);
      }
    }
  }, [rulerX, idealRulerX, isSnapped]);

  if (!currentObject) return null;

  const objectWidthPx = currentObject.lengthCm * PIXELS_PER_CM;

  // Mouse/Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartRulerX.current = rulerX;

    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;
    let newX = dragStartRulerX.current + deltaX;
    newX = Math.max(-50, Math.min(260, newX));
    setRulerX(newX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      if (containerRef.current) {
        containerRef.current.releasePointerCapture(e.pointerId);
      }
    }
  };

  const handleAnswerSelect = (cm: number) => {
    setSelectedAnswer(cm);
    playClickSound();

    if (cm === currentObject.lengthCm) {
      if (isSnapped) {
        setFeedback('CORRECT');
        playSuccessChime();
      } else {
        setFeedback('WRONG_ALIGN');
        playClearSound();
      }
    } else {
      setFeedback('WRONG_VALUE');
      playClearSound();
    }
  };

  const forceSnapToZero = () => {
    setRulerX(idealRulerX);
    setIsSnapped(true);
    playSnapSound();
  };

  return (
    <div id="simple-ruler-classroom" className="w-full flex flex-col gap-6">
      
      {/* Unified Canvas Stage */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
        
        {/* Top Header: Identity & Status */}
        <div className="flex items-center justify-between z-10 px-2">
          <div className="flex items-center gap-4">
            <div className="text-4xl lg:text-5xl drop-shadow-sm">{currentObject.emoji}</div>
            <h2 className="font-extrabold text-2xl lg:text-3xl text-slate-800 tracking-tight">{currentObject.name}</h2>
          </div>
          
          <button
            onClick={forceSnapToZero}
            className={`px-5 py-3 rounded-[16px] text-[13px] font-bold transition-all duration-200 border ${
              isSnapped 
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isSnapped ? '🟢 0점 정렬 완료' : '🎯 0점 맞추기'}
          </button>
        </div>

        {/* Interactive Drag Area (RULER & OBJECT) */}
        <div 
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="bg-slate-50 rounded-[24px] h-48 md:h-56 relative overflow-hidden cursor-grab active:cursor-grabbing border border-slate-100"
        >
          <div className="relative w-full h-full min-w-[600px]">
            {/* Start Reference Alignment Line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 border-l-[3px] border-dashed border-red-500 z-15 flex flex-col items-center pointer-events-none"
              style={{ left: `${objectStartLeft}px` }}
            >
              <span className="absolute top-0 bg-red-500 text-white text-[11px] px-2.5 py-1 rounded-b-lg font-black whitespace-nowrap transform -translate-x-1/2">
                시작 [0]
              </span>
            </div>

            {/* Target Object */}
            <div 
              className="absolute top-8 h-12 md:h-16 rounded-2xl flex items-center px-4 shadow-sm border border-black/5 pointer-events-none transition-all duration-300"
              style={{ 
                left: `${objectStartLeft}px`, 
                width: `${objectWidthPx}px`,
                backgroundColor: currentObject.color
              }}
            >
              <span className="text-3xl opacity-90">{currentObject.emoji}</span>
            </div>

            {/* Virtual Ruler */}
            <div
              id="draggable-ruler-instance"
              className={`absolute bottom-4 h-16 md:h-20 rounded-xl flex items-start select-none border transition-all duration-75 ${
                isSnapped 
                  ? 'border-green-400 bg-white/95 shadow-[0_4px_20px_rgba(74,222,128,0.3)]' 
                  : 'border-slate-200 bg-white/90 shadow-sm'
              }`}
              style={{ 
                left: `${rulerX}px`, 
                width: `${rulerWidthPx + 40}px`
              }}
            >
              {/* Left buffer safety zone */}
              <div className="w-[20px] h-full border-r border-gray-100 bg-gray-50/50 rounded-l-xl" />

              {/* Main ticks & labels area */}
              <div className="relative h-full flex-1 flex flex-col justify-between pointer-events-none">
                
                {/* Tick marks */}
                <div className="w-full flex items-start justify-between h-4 relative">
                  {Array.from({ length: MAX_RULER_CM * 5 + 1 }).map((_, tic) => {
                    const cmValue = tic / 5;
                    const isMainUnit = tic % 5 === 0;
                    
                    let heightStr = 'h-2 md:h-2.5 bg-gray-300';
                    if (isMainUnit) heightStr = 'h-4 md:h-5 bg-slate-700 w-[2px] md:w-[2.5px]';

                    return (
                      <div 
                        key={tic} 
                        className="absolute top-0 flex flex-col items-center" 
                        style={{ left: `${cmValue * tickMultiplier}px` }}
                      >
                        <div className={`${heightStr}`} />
                      </div>
                    );
                  })}
                </div>

                {/* Centimeter numeric labels */}
                <div className="absolute bottom-2 md:bottom-3 w-full flex justify-between select-none px-0">
                  {Array.from({ length: MAX_RULER_CM + 1 }).map((_, cmIdx) => (
                    <div 
                      key={cmIdx} 
                      className={`absolute bottom-0 flex items-baseline justify-center leading-none tracking-tighter ${
                        cmIdx === 0 ? 'text-red-500 text-lg md:text-xl font-black' : 'text-slate-800 text-lg md:text-xl font-bold'
                      }`} 
                      style={{ 
                        left: `${cmIdx * tickMultiplier}px`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <span className="font-sans">{cmIdx}</span>
                      {cmIdx > 0 && <span className="text-[10px] font-sans font-semibold text-gray-400 ml-[1px]">cm</span>}
                      {cmIdx === 0 && <span className="text-[10px] font-sans font-black text-red-500 ml-[1px]">cm</span>}
                    </div>
                  ))}
                </div>

              </div>

              {/* Right buffer zone */}
              <div className="w-[20px] h-full border-l border-gray-100 rounded-r-xl bg-gray-50/10" />

            </div>
          </div>
        </div>
      </div>

      {/* Answer Board */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between gap-6 overflow-hidden max-md:flex-col">
        
        {/* Buttons grid from 3cm to 14cm */}
        <div className="grid grid-cols-6 max-sm:grid-cols-4 gap-2 flex-1 w-full shrink-0">
          {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((cm) => {
            const isChosen = selectedAnswer === cm;
            return (
              <button
                key={cm}
                onClick={() => handleAnswerSelect(cm)}
                className={`py-4 md:py-5 rounded-[18px] text-xl font-black transition-all duration-200 transform active:scale-95 border-2 select-none flex items-baseline justify-center ${
                  isChosen
                    ? 'bg-slate-800 border-slate-800 text-white shadow-md'
                    : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cm}<span className="text-sm font-bold text-opacity-50 ml-[1px] tracking-tight">cm</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert & Next Button Row */}
        <div className="flex flex-col gap-4 items-center justify-center shrink-0 max-md:w-full">
          <button
            onClick={createNewRound}
            className="h-16 px-8 max-md:w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-base rounded-[20px] shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-95 whitespace-nowrap"
          >
            <RefreshCw size={20} strokeWidth={3} />
            다음 물건
          </button>
          
          <div className="h-12 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {feedback !== 'IDLE' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-1 w-full text-center"
                >
                  {feedback === 'CORRECT' && (
                    <p className="font-black text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl">✨ 정답입니다!</p>
                  )}
                  {feedback === 'WRONG_ALIGN' && (
                    <p className="font-extrabold text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">⚠️ 시작선을 맞추세요</p>
                  )}
                  {feedback === 'WRONG_VALUE' && (
                    <p className="font-extrabold text-sm text-rose-500 bg-rose-50 px-4 py-2 rounded-xl">❌ 다시 세어보세요</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );
}
