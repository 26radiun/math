import React, { useState } from 'react';
import { playClickSound, playPopSound } from '../utils/audio';
import { HelpCircle, RefreshCw, Equal, ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function DirectCompare() {
  const [lollipopHeight, setLollipopHeight] = useState<number>(8); // In virtual cm
  const [featherHeight, setFeatherHeight] = useState<number>(10);   // In virtual cm
  const [isAligned, setIsAligned] = useState<boolean>(false);

  const scale = 24; // Scale factor for visual heights

  const toggleAlignment = () => {
    setIsAligned(!isAligned);
    playPopSound();
  };

  const resetValues = () => {
    setLollipopHeight(8);
    setFeatherHeight(10);
    setIsAligned(false);
    playClickSound();
  };

  return (
    <div id="direct-comparison-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* Target Objects Controls */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Step Intro */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-black/5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">활동 0</span>
            <h3 className="font-semibold text-gray-800 text-sm">한 번에 대고 비교하기</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            자와 같은 눈금 도구가 없을 때, 어떤 것이 더 길고 더 짧은지 <strong>눈대중이 아닌 맞춤 비교</strong>로 알아봅시다!
          </p>
        </div>

        {/* Height Adjustments Sliders */}
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm space-y-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
            🎈 비교할 물건 키 키우기
          </label>
          
          {/* Lollipop Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-gray-700">
              <span className="font-semibold flex items-center gap-1">🍭 딸기맛 막대사탕</span>
              <span className="font-mono text-[10px] text-gray-500">{lollipopHeight}cm 크기</span>
            </div>
            <input
              id="lollipop-height-slider"
              type="range"
              min="5"
              max="14"
              value={lollipopHeight}
              onChange={(e) => {
                setLollipopHeight(parseInt(e.target.value));
                playClickSound();
              }}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FC80A5]"
            />
          </div>

          {/* Feather Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-gray-700">
              <span className="font-semibold flex items-center gap-1">🪶 하늘깃털</span>
              <span className="font-mono text-[10px] text-gray-500">{featherHeight}cm 크기</span>
            </div>
            <input
              id="feather-height-slider"
              type="range"
              min="5"
              max="14"
              value={featherHeight}
              onChange={(e) => {
                setFeatherHeight(parseInt(e.target.value));
                playClickSound();
              }}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4A90E2]"
            />
          </div>
        </div>

        {/* Align Button Card */}
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm space-y-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
            ⚖️ 끝선(바닥) 조절하기
          </label>
          
          <button
            id="btn-toggle-align"
            onClick={toggleAlignment}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center gap-2 ${
              isAligned 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100'
            }`}
          >
            {isAligned ? (
              <>
                <Check size={14} className="stroke-[3]" />
                완벽정렬! 바닥면 일치함
              </>
            ) : (
              <>
                ⚡ 바닥(시작선) 똑같이 맞추기
              </>
            )}
          </button>

          <button
            id="btn-compare-reset"
            onClick={resetValues}
            className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-xs rounded-xl transition flex items-center justify-center gap-1"
          >
            <RefreshCw size={11} />
            다시 처음처럼 돌리기
          </button>
        </div>

      </div>

      {/* Main Comparative Canvas Stage */}
      <div className="lg:col-span-8 space-y-6">
        
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/5 shadow-lg relative min-h-[380px] flex flex-col justify-between overflow-x-auto select-none">
          
          {/* Header text */}
          <div className="mb-4">
            <h4 className="font-extrabold text-gray-800 text-lg">막대사탕과 깃털의 키 비교</h4>
            <p className="text-xs text-gray-500">
              {isAligned 
                ? "바닥 선을 똑같이 정렬했어요! 이제 어느 쪽의 키가 진짜 큰가요?" 
                : "앗, 두 물건의 바닥 시작선이 어긋나 있어요. 겉만 보고 속아버릴 수 있어요!"
              }
            </p>
          </div>

          {/* Graphical Display Zone */}
          <div className="relative border-y border-dashed border-gray-100 h-64 bg-slate-50/50 rounded-2xl my-3 flex items-end justify-center gap-20 px-8">
            
            {/* Visual Red/Green Baseline Grid Line */}
            {isAligned ? (
              <div className="absolute left-8 right-8 bottom-[40px] border-b-2 border-dashed border-emerald-500 flex justify-between z-10">
                <span className="bg-emerald-500 text-white text-[9px] px-1 rounded -top-5 relative whitespace-nowrap">
                  바닥 시작선이 같음 (올바른 비교)
                </span>
                <span className="text-[10px] text-emerald-600 font-bold -top-4 relative">0cm</span>
              </div>
            ) : (
              <div className="absolute left-8 right-8 bottom-[40px] border-b border-dashed border-red-300">
                <span className="bg-red-400 text-white text-[9px] px-1 rounded -top-5.5 relative whitespace-nowrap">
                  바닥면이 삐뚤빼뚤해요! (잘못 비교 중)
                </span>
              </div>
            )}

            {/* Lollipop Draw */}
            <div className="flex flex-col items-center relative transition-all duration-500" style={{ transform: isAligned ? `translateY(0)` : `translateY(-30px)` }}>
              
              {/* Lollipop Stick with delicious candy top */}
              <div className="flex flex-col items-center justify-end" style={{ height: `${lollipopHeight * scale}px` }}>
                {/* Visual Sweet bubble candy circle */}
                <div className="w-14 h-14 rounded-full bg-[#FC80A5] border-2 border-white shadow-sm flex items-center justify-center text-3xl">
                  🍭
                </div>
                {/* Stick */}
                <div className="w-2.5 flex-1 bg-amber-100 border border-amber-200" />
              </div>

              {/* Individual stand footer */}
              <div className="h-10 w-24 bg-rose-100 border-t border-rose-200 flex items-center justify-center text-[10px] text-rose-800 font-bold rounded-t-lg mt-0.5">
                딸기사탕 받침대
              </div>
            </div>

            {/* Feather Draw */}
            <div className="flex flex-col items-center relative transition-all duration-500" style={{ transform: `translateY(0)` }}>
              
              {/* Feather visual style with height */}
              <div className="flex flex-col items-center justify-end" style={{ height: `${featherHeight * scale}px` }}>
                {/* Soft blue feather top */}
                <div className="w-10 flex-1 rounded-t-full bg-gradient-to-t from-blue-300 to-sky-100 border border-blue-400/30 flex items-center justify-center text-3xl">
                  🪶
                </div>
                {/* Quill stem */}
                <div className="w-1.5 h-6 bg-blue-400" />
              </div>

              {/* Individual stand footer */}
              <div className="h-10 w-24 bg-sky-100 border-t border-sky-200 flex items-center justify-center text-[10px] text-sky-800 font-bold rounded-t-lg mt-0.5">
                하늘깃털 받침대
              </div>
            </div>

          </div>

          {/* Pedagogical review card */}
          <div className="mt-4 bg-slate-50 rounded-2xl p-4 border border-black/5">
            <div className="flex items-start gap-3">
              <HelpCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1 leading-relaxed">
                <h5 className="font-bold text-xs text-gray-700">생각 정리하기</h5>
                
                {/* Analytical text based on choices */}
                <div className="text-[11.5px] text-gray-600">
                  {isAligned ? (
                    <p className="font-semibold text-emerald-800">
                      👍 참 잘했어요! 이제 두 물건의 제일 밑(바닥선)이 완벽하게 맞춰져 있으므로, <strong>위로 튀어나온 끝</strong>을 비교하면 됩니다.{' '}
                      {lollipopHeight === featherHeight ? (
                        <span>두 개는 현재 키가 완전히 같아요!</span>
                      ) : lollipopHeight > featherHeight ? (
                        <span>사탕(🍭)의 끝 부분이 깃털보다 위로 튀어나와 있어 <strong>사탕이 더 깁니다</strong>!</span>
                      ) : (
                        <span>깃털(🪶)의 끝 부분이 사탕보다 위로 튀어나와 있어 <strong>깃털이 더 깁니다</strong>!</span>
                      )}
                    </p>
                  ) : (
                    <p>
                      🔴 지금 상태에서 그냥 보면 어때요? 바닥이 삐뚤삐뚤해서 눈만 보았을 때 어느 하나가 더 긴 것 같지만,{' '}
                      <strong>그것은 가짜 길이에요!</strong> 사탕의 바닥 밑동이 이미 위쪽에 걸쳐져 있기 때문에, 지금 비교 결과는 옳지 않아요. 왼쪽의 <strong>'바닥 똑같이 맞추기'</strong>를 눌러 시작선을 일치시켜 보세요!
                    </p>
                  )}
                </div>

                <div className="pt-2 text-[10px] text-gray-400 leading-normal border-t border-gray-200/60 mt-2">
                  💡 <strong>단원 요점 정리:</strong> 물건의 길이를 눈으로 직접 비교할 때에는, **시작하는 첫 번째 한쪽 끝**을 반드시 정확히 똑같이 정렬하고 나서 나머지 끝부분의 길고 짧음을 재어야 정확합니다.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
