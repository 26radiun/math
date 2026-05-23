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
    <div id="simple-ruler-classroom" className="w-full max-w-2xl mx-auto space-y-4">
      
      {/* 1. Object Display Banner */}
      <div className="bg-white rounded-3xl p-4 border border-black/5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{currentObject.emoji}</div>
          <div>
            <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
              <span>오늘의 물건: {currentObject.name}</span>
            </h3>
            <p className="text-[11px] text-gray-400">길이를 어라? 하고 잘 보고 정답을 맞춰주세요</p>
          </div>
        </div>

        {/* Dynamic Indicator */}
        <button
          onClick={forceSnapToZero}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition border ${
            isSnapped 
              ? 'bg-green-500 text-white border-green-500 shadow-sm'
              : 'bg-amber-100 text-amber-700 border-amber-200'
          }`}
        >
          {isSnapped ? '🟢 0점 정렬 완료!' : '🎯 0점 자동 맞추기'}
        </button>
      </div>

      {/* Guide Instruction under the display card */}
      <div className="flex items-center gap-1.5 px-2 text-[10px] font-black text-slate-500">
        <span>👇</span>
        <span>자를 드래그하여 물건의 빨간 시작선[0]에 정확히 맞춰주세요. (물건과 자는 가로 세로 겹치지 않고 위아래에 나뉩니다!)</span>
      </div>

      {/* 2. Interactive Drag Stage (RULER & OBJECT) */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="bg-white rounded-3xl p-4 border border-black/5 shadow-md relative h-40 flex flex-col justify-end overflow-hidden cursor-grab select-none active:cursor-grabbing"
      >
        <div className="relative w-full h-full min-w-[500px]">
          {/* Start Reference Alignment Line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-red-500 z-15 flex flex-col items-center pointer-events-none"
            style={{ left: `${objectStartLeft}px` }}
          >
            <span className="absolute top-0 bg-red-500 text-white text-[8px] px-1 rounded font-bold whitespace-nowrap transform -translate-x-1/2 shadow-sm">
              시작 [0]
            </span>
          </div>

          {/* Render target object - positioned safely inside its own top lane */}
          <div 
            className="absolute top-6 h-10 rounded-xl flex items-center px-3 text-white shadow-sm border border-black/5 pointer-events-none transition-all duration-300"
            style={{ 
              left: `${objectStartLeft}px`, 
              width: `${objectWidthPx}px`,
              backgroundColor: currentObject.color
            }}
          >
            <span className="text-xl mr-1.5">{currentObject.emoji}</span>
            <span className="text-[10px] font-black tracking-tight leading-none bg-black/20 py-1 px-2.5 rounded-full">
              {currentObject.name}
            </span>
          </div>

          {/* Virtual Ruler with Drag - positioned in its own bottom lane (absolute separation) */}
          <div
            id="draggable-ruler-instance"
            className={`absolute bottom-1 h-14 rounded-lg flex items-start select-none border shadow transition-all duration-75 ${
              isSnapped 
                ? 'border-green-400 bg-white/95 shadow-green-100/50' 
                : 'border-slate-300 bg-white/90 shadow-gray-100/50'
            }`}
            style={{ 
              left: `${rulerX}px`, 
              width: `${rulerWidthPx + 40}px`
            }}
          >
            {/* Snap Effect halo */}
            {isSnapped && (
              <div className="absolute inset-0 border border-green-500 rounded-lg animate-pulse pointer-events-none" />
            )}

            {/* Left buffer safety zone */}
            <div className="w-[20px] h-full border-r border-gray-300/30 bg-gray-50/50 rounded-l-lg flex items-center justify-center text-[9px] text-gray-400 pointer-events-none font-bold">
              📏
            </div>

            {/* Main ticks & labels area */}
            <div className="relative h-full flex-1 flex flex-col justify-between pointer-events-none">
              
              {/* Tick marks */}
              <div className="w-full flex items-start justify-between h-3 relative">
                {Array.from({ length: MAX_RULER_CM * 5 + 1 }).map((_, tic) => {
                  const cmValue = tic / 5;
                  const isMainUnit = tic % 5 === 0;
                  
                  let heightStr = 'h-1.5 bg-gray-400/80';
                  if (isMainUnit) heightStr = 'h-3 bg-slate-800 w-[1.5px]';

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
              <div className="absolute bottom-0 w-full h-5 flex justify-between select-none px-0">
                {Array.from({ length: MAX_RULER_CM + 1 }).map((_, cmIdx) => (
                  <div 
                    key={cmIdx} 
                    className={`absolute bottom-0 text-center font-mono font-bold text-[10px] flex flex-col items-center justify-end leading-none ${
                      cmIdx === 0 ? 'text-red-500 font-extrabold' : 'text-slate-800'
                    }`} 
                    style={{ 
                      left: `${cmIdx * tickMultiplier}px`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <span>{cmIdx}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Right buffer zone */}
            <div className="w-[20px] h-full border-l border-gray-300/10 rounded-r-lg bg-gray-50/10" />

          </div>

        </div>

      </div>

      {/* 3. Direct CM Answer Selection Buttons (핵심: 정답 선택 버튼) */}
      <div className="bg-white rounded-3xl p-5 border border-black/5 shadow-md space-y-4">
        
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider">
            정답 선택하기
          </span>
          <h4 className="font-extrabold text-gray-800 text-sm">
            {currentObject.name}의 길이는 몇 cm인가요? 아래에서 정형화된 길이를 꾹 누르세요!
          </h4>
        </div>

        {/* Buttons grid from 3cm to 14cm */}
        <div className="grid grid-cols-6 gap-2">
          {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((cm) => {
            const isChosen = selectedAnswer === cm;
            return (
              <button
                key={cm}
                id={`btn-select-choice-${cm}`}
                onClick={() => handleAnswerSelect(cm)}
                className={`py-3.5 rounded-2xl text-sm font-black transition-all transform active:scale-95 border select-none ${
                  isChosen
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'bg-slate-50 border-black/5 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {cm}cm
              </button>
            );
          })}
        </div>

        {/* Visual Real-time Kid-friendly Feedback Alert */}
        <AnimatePresence mode="wait">
          {feedback !== 'IDLE' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pt-2"
            >
              {feedback === 'CORRECT' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3 text-left">
                  <span className="text-2xl">🎉</span>
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-green-900 text-xs">딩동댕! 백점 정답입니다! 🏆</p>
                    <p className="text-[11px] text-green-700 leading-normal">
                      시작선을 <strong>0cm</strong>에 정밀하게 맞췄고, 눈금 끝도 딱 맞추어 <strong className="font-mono text-xs">{currentObject.lengthCm}cm</strong>를 정확히 찾아냈어요!
                    </p>
                  </div>
                </div>
              )}

              {feedback === 'WRONG_ALIGN' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-left">
                  <span className="text-2xl">⚠️</span>
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-amber-900 text-xs">숫자는 맞지만, 자가 비뚤어졌어요!</p>
                    <p className="text-[11px] text-amber-700 leading-normal">
                      {currentObject.name}은(는) {currentObject.lengthCm}cm가 맞아요! 하지만 자의 첫 시작인 <strong>0 숫자</strong>를 빨간색 시작선에 먼저 비벼서 맞춰줘야 해요!
                    </p>
                  </div>
                </div>
              )}

              {feedback === 'WRONG_VALUE' && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-3 text-left">
                  <span className="text-2xl">😭</span>
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-rose-900 text-xs font-sans">눈금을 아기눈으로 다시 조심조심 맞춰보세요!</p>
                    <p className="text-[11px] text-rose-700 leading-normal">
                      선택한 {selectedAnswer}cm는 맞지 않아요. 시작지점(0점)을 정렬하고 물건 맨끝에 걸린 자의 눈금을 정확히 보아주세요!
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play Another / Scramble Object button ("다시하기") */}
        <div className="pt-2 border-t border-gray-100 flex justify-center">
          <button
            id="btn-play-again-rnd"
            onClick={createNewRound}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <RefreshCw size={14} className="stroke-[2.5]" />
            새로운 무작위 물건 꺼내기 (다시하기!)
          </button>
        </div>

      </div>

    </div>
  );
}
