import React, { useState, useEffect, useRef } from 'react';
import { playSnapSound, playClickSound, playSuccessChime, playClearSound, playPopSound } from '../utils/audio';
import { RefreshCw, Play, Pause, Trophy, Timer, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PIXELS_PER_CM = 38; // slightly larger for clean single view visibility
const MAX_RULER_CM = 15;
const tickMultiplier = PIXELS_PER_CM;
const rulerWidthPx = MAX_RULER_CM * tickMultiplier;

// Start position of the object relative to the stage
const objectStartLeft = 100;
const TOTAL_ROUNDS = 10;

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
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'RESULT'>('START');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0); 
  const [isPaused, setIsPaused] = useState(false);
  const [hasScoredThisRound, setHasScoredThisRound] = useState(false);

  const [currentObject, setCurrentObject] = useState<GeneratedObject | null>(null);
  const [rulerX, setRulerX] = useState<number>(30); 
  const [isSnapped, setIsSnapped] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'IDLE' | 'CORRECT' | 'WRONG_ALIGN' | 'WRONG_VALUE'>('IDLE');

  const idealRulerX = objectStartLeft - 20;

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragStartRulerX = useRef<number>(0);

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState === 'PLAYING' && !isPaused) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, isPaused]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    setGameState('PLAYING');
    setRound(1);
    setScore(0);
    setTime(0);
    setIsPaused(false);
    createNewRound();
  };

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
    setHasScoredThisRound(false);
    playPopSound();
  };

  const handleNextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      setGameState('RESULT');
    } else {
      setRound(prev => prev + 1);
      createNewRound();
    }
  };

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

  // Mouse/Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPaused || feedback === 'CORRECT') return; // Prevent drag if paused or round complete
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
    if (!isDragging.current || isPaused || feedback === 'CORRECT') return;
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
    if (isPaused || feedback === 'CORRECT') return; // block input
    
    setSelectedAnswer(cm);
    playClickSound();

    if (cm === currentObject?.lengthCm) {
      if (isSnapped) {
        setFeedback('CORRECT');
        playSuccessChime();
        if (!hasScoredThisRound) {
          setScore(prev => prev + 10);
          setHasScoredThisRound(true);
        }
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
    if (isPaused || feedback === 'CORRECT') return;
    setRulerX(idealRulerX);
    setIsSnapped(true);
    playSnapSound();
  };

  if (gameState === 'START') {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 px-8">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4 flex flex-col items-center gap-3">
          <span className="text-6xl drop-shadow-sm">📏</span>
          자로 똑바로 재기
        </h1>
        <p className="text-slate-500 font-medium mb-12 text-center max-w-sm">
          물건의 길이를 재는 방법을 배워볼까요?<br/>총 {TOTAL_ROUNDS}문제를 풀고 점수를 올려보세요!
        </p>
        <button
          onClick={startGame}
          className="h-16 px-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xl rounded-2xl shadow-lg shadow-blue-500/30 flex items-center gap-3 transition-transform active:scale-95"
        >
          <Play size={24} fill="currentColor" />
          시작하기
        </button>
      </div>
    );
  }

  if (gameState === 'RESULT') {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 px-8 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <Trophy size={64} className="text-yellow-400 mb-6 drop-shadow-md" />
        <h2 className="text-3xl font-black text-slate-800 mb-2">게임 종료!</h2>
        <div className="flex flex-wrap gap-6 mt-6 mb-12 justify-center">
          <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center min-w-[140px] border border-slate-100">
            <span className="text-sm font-bold text-slate-400 mb-1">최종 점수</span>
            <span className="text-4xl font-black text-blue-600">{score}점</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center min-w-[140px] border border-slate-100">
            <span className="text-sm font-bold text-slate-400 mb-1">걸린 시간</span>
            <span className="text-4xl font-black text-slate-700">{formatTime(time)}</span>
          </div>
        </div>
        <button
          onClick={startGame}
          className="h-14 px-8 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-extrabold text-lg rounded-2xl shadow-md flex items-center gap-3 transition-transform active:scale-95"
        >
          <RotateCcw size={20} />
          다시 하기
        </button>
      </div>
    );
  }

  if (!currentObject) return null;

  const objectWidthPx = currentObject.lengthCm * PIXELS_PER_CM;

  return (
    <div id="simple-ruler-classroom" className="w-full flex flex-col gap-4 relative">
      
      {/* Pause Mode Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-[32px]">
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.1)]">
            <h2 className="text-2xl font-black text-slate-800 mb-6">일시 정지</h2>
            <button
              onClick={() => setIsPaused(false)}
              className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
            >
              <Play size={20} fill="currentColor" /> 계속하기
            </button>
          </div>
        </div>
      )}

      {/* HUD Header */}
      <div className="bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between z-20">
        <div className="flex gap-4 items-center">
          <div className="bg-blue-50 text-blue-700 font-extrabold px-3 py-1.5 rounded-xl text-sm flex items-center gap-2 border border-blue-100/50 shadow-inner">
            문제 <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-xs">{round} / {TOTAL_ROUNDS}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">점수</span>
            <span className="font-black text-slate-800 text-lg">{score}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 min-w-[80px] justify-center">
            <Timer size={14} className="text-slate-400" />
            {formatTime(time)}
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors border ${
              isPaused ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
          </button>
        </div>
      </div>

      {/* Unified Canvas Stage */}
      <div className={`bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-6 relative overflow-hidden transition-opacity ${isPaused ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Top Header: Identity & Status */}
        <div className="flex items-center justify-between z-10 px-2">
          <div className="flex items-center gap-4">
            <div className="text-4xl lg:text-5xl drop-shadow-sm">{currentObject.emoji}</div>
            <h2 className="font-extrabold text-2xl lg:text-3xl text-slate-800 tracking-tight">{currentObject.name}</h2>
          </div>
          
          <button
            onClick={forceSnapToZero}
            disabled={feedback === 'CORRECT'}
            className={`px-5 py-3 rounded-[16px] text-[13px] font-bold transition-all duration-200 border ${
              isSnapped 
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 disabled:opacity-50'
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
          className={`bg-slate-50 rounded-[24px] h-48 md:h-56 relative overflow-hidden border border-slate-100 ${
            feedback === 'CORRECT' ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
          }`}
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
      <div className={`bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between gap-6 overflow-hidden max-md:flex-col ${isPaused ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Buttons grid from 3cm to 14cm */}
        <div className="grid grid-cols-6 max-sm:grid-cols-4 gap-2 flex-1 w-full shrink-0">
          {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((cm) => {
            const isChosen = selectedAnswer === cm;
            return (
              <button
                key={cm}
                disabled={feedback === 'CORRECT'}
                onClick={() => handleAnswerSelect(cm)}
                className={`py-4 md:py-5 rounded-[18px] text-xl font-black transition-all duration-200 transform active:scale-95 border-2 select-none flex items-baseline justify-center disabled:opacity-60 disabled:active:scale-100 ${
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
          {feedback === 'CORRECT' ? (
            <button
              onClick={handleNextRound}
              className="h-16 px-8 max-md:w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-base rounded-[20px] shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-95 whitespace-nowrap animate-pulse"
            >
              목표 달성! 다음 문제
            </button>
          ) : (
            <button
              disabled
              className="h-16 px-8 max-md:w-full bg-slate-100 text-slate-400 font-extrabold text-base rounded-[20px] flex items-center justify-center gap-2 whitespace-nowrap opacity-50 cursor-not-allowed"
            >
              정답을 맞춰보세요
            </button>
          )}
          
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
                    <p className="font-black text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl">✨ 정답입니다! (+10점)</p>
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

