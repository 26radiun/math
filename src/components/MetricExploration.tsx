import React, { useState, useEffect } from 'react';
import { MEASURABLE_OBJECTS, EXPLORATORY_UNITS, PIXELS_PER_CM } from '../data';
import { playPopSound, playClearSound, playSuccessChime } from '../utils/audio';
import { Plus, Trash2, HelpCircle, ArrowRight, BookOpen, Layers } from 'lucide-react';

export default function MetricExploration() {
  const [selectedObjectId, setSelectedObjectId] = useState(MEASURABLE_OBJECTS[0].id);
  const [selectedUnitId, setSelectedUnitId] = useState(EXPLORATORY_UNITS[0].id);
  const [unitCount, setUnitCount] = useState<number>(1);
  const [showRulerHints, setShowRulerHints] = useState(true);

  const selectedObject = MEASURABLE_OBJECTS.find(o => o.id === selectedObjectId) || MEASURABLE_OBJECTS[0];
  const selectedUnit = EXPLORATORY_UNITS.find(u => u.id === selectedUnitId) || EXPLORATORY_UNITS[0];

  const objectWidthPx = selectedObject.lengthCm * PIXELS_PER_CM;
  const unitWidthPx = selectedUnit.sizeCm * PIXELS_PER_CM;
  const idealCount = selectedObject.lengthCm / selectedUnit.sizeCm;

  useEffect(() => {
    // Reset unit count when object or unit changes to make it engaging
    setUnitCount(1);
    playPopSound();
  }, [selectedObjectId, selectedUnitId]);

  const addUnit = () => {
    // Max capacity based on viewport space
    if (unitCount < 12) {
      setUnitCount(prev => prev + 1);
      playPopSound();
    }
  };

  const removeUnit = () => {
    if (unitCount > 0) {
      setUnitCount(prev => prev - 1);
      playPopSound();
    }
  };

  const clearUnits = () => {
    setUnitCount(0);
    playClearSound();
  };

  // Helper to diagnose measurement accuracy
  const totalCoveredCm = unitCount * selectedUnit.sizeCm;
  const differenceCm = selectedObject.lengthCm - totalCoveredCm;

  // Sound chime if perfect matching occurs
  useEffect(() => {
    if (unitCount > 0 && Math.abs(differenceCm) < 0.2) {
      playSuccessChime();
    }
  }, [unitCount]);

  return (
    <div id="metric-exploration-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* Target Objects & Unit Selector Cards */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Step Intro */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-black/5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-md font-medium">활동 1</span>
            <h3 className="font-semibold text-gray-800 text-sm">내 맘대로 단위로 재기</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            자로 재기 전에, 클립이나 지우개 같은 <strong>생활 속 물건</strong>을 올려놓아 몇 배인지 어림해 보아요!
          </p>
        </div>

        {/* Object selection */}
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm space-y-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
            📐 잴 물건 고르기
          </label>
          <div className="grid grid-cols-4 gap-2">
            {MEASURABLE_OBJECTS.map(obj => {
              const isSelected = obj.id === selectedObjectId;
              return (
                <button
                  key={obj.id}
                  id={`btn-obj-${obj.id}`}
                  onClick={() => setSelectedObjectId(obj.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition duration-200 outline-none ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10 scale-105'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-black/5'
                  }`}
                >
                  <span className="text-2xl mb-1">{obj.emoji}</span>
                  <span className="text-[10px] font-medium tracking-tight truncate w-full text-center">
                    {obj.name}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg">
            <strong>{selectedObject.name}</strong>: {selectedObject.description}
          </p>
        </div>

        {/* Measuring unit selection */}
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm space-y-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
            🧺 단위 물건 고르기
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EXPLORATORY_UNITS.map(unit => {
              const isSelected = unit.id === selectedUnitId;
              return (
                <button
                  key={unit.id}
                  id={`btn-unit-${unit.id}`}
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition duration-200 text-left border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/15 scale-[1.02]'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-black/5'
                  }`}
                >
                  <span className="text-2xl">{unit.emoji}</span>
                  <div>
                    <div className="text-xs font-bold leading-tight">{unit.name}</div>
                    <div className={`text-[10px] leading-tight ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                      크기: 약 {unit.sizeCm}cm
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Main Interactive Stage */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Simulation Stage Board */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/5 shadow-lg overflow-hidden relative">
          
          {/* Top Stage Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h4 className="font-bold text-gray-800 text-lg flex items-center gap-1.5">
                <span>{selectedObject.emoji} {selectedObject.name}</span>
                <span className="text-sm font-normal text-gray-400">길이 비하기</span>
              </h4>
              <p className="text-xs text-gray-500">
                시작선에 맞춰서 {selectedUnit.name}을 쌓아가며 정확히 재보아요!
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
              <button
                id="btn-remove-unit"
                onClick={removeUnit}
                disabled={unitCount === 0}
                className="p-1 px-3 bg-white text-xs text-gray-600 rounded-lg hover:bg-red-50 disabled:opacity-40 transition font-medium"
              >
                빼기 (-)
              </button>
              <button
                id="btn-add-unit"
                onClick={addUnit}
                disabled={unitCount >= 10}
                className="p-1 px-3 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-40 transition font-bold shadow-sm"
              >
                더하기 (+)
              </button>
              <button
                id="btn-clear-units"
                onClick={clearUnits}
                title="처음부터 다시 쌓기"
                className="p-1 px-2 text-gray-400 hover:text-red-500 rounded-lg transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Visual measuring workspace - holds the objects and custom units */}
          <div className="relative border-y border-dashed border-gray-100 py-10 my-4 bg-slate-50/50 rounded-2xl min-h-[220px] flex flex-col justify-center items-start overflow-x-auto select-none px-4 scrollbar-thin">
            
            <div className="relative w-full" style={{ width: `${Math.max(540, objectWidthPx + 100)}px` }}>
              
              {/* Start Alignment Dashed Line */}
              <div className="absolute left-[20px] top-[-30px] bottom-[-30px] w-0.5 border-l-2 border-dashed border-blue-400/80 z-20 flex flex-col items-center">
                <span className="bg-blue-500 text-white text-[9px] font-bold px-1 rounded absolute -top-5.5 whitespace-nowrap">
                  시작선
                </span>
                <div className="absolute -bottom-6 text-[10px] text-blue-500 font-bold">0cm</div>
              </div>

              {/* End Alignment Dashed Line (for the selected Object itself) */}
              <div className="absolute top-[-30px] bottom-[-30px] w-0.5 border-l-2 border-dashed border-amber-400/40 z-10 flex flex-col items-center transition-all duration-300" style={{ left: `${20 + objectWidthPx}px` }}>
                <span className="bg-amber-500 text-white text-[9px] font-bold px-1 rounded absolute -top-5.5 whitespace-nowrap">
                  끝선
                </span>
                <div className="absolute -bottom-6 text-[10px] text-amber-600 font-bold">
                  {selectedObject.lengthCm}cm
                </div>
              </div>

              {/* 1. Measurable Object Draw */}
              <div className="relative left-[20px] h-20 mb-8 flex items-center">
                <div 
                  className="rounded-xl flex items-center justify-between px-4 text-white relative shadow-sm border border-black/5" 
                  style={{ 
                    width: `${objectWidthPx}px`, 
                    backgroundColor: selectedObject.color,
                    height: '56px'
                  }}
                >
                  <span className="text-3xl filter drop-shadow-sm">{selectedObject.emoji}</span>
                  <span className="text-xs font-bold tracking-widest bg-black/10 px-2 py-0.5 rounded-full">
                    {selectedObject.name}
                  </span>
                  <div className="absolute inset-x-0 bottom-1 flex justify-center text-[10px] text-white/70">
                    길이: ? cm
                  </div>
                </div>
              </div>

              {/* 2. Units Grid Draw */}
              <div className="relative left-[20px] min-h-[60px] flex items-center gap-0">
                {unitCount === 0 ? (
                  <div className="text-xs text-gray-400 italic py-4 pl-4">
                    위의 '더하기 (+)' 버튼을 눌러서 {selectedUnit.name}을 나열해 보세요!
                  </div>
                ) : (
                  Array.from({ length: unitCount }).map((_, index) => (
                    <div
                      key={index}
                      className="relative flex items-center justify-center border border-white rounded-lg shadow-sm transition hover:scale-105 select-none"
                      style={{
                        width: `${unitWidthPx}px`,
                        height: '48px',
                        backgroundColor: selectedUnit.color + 'E6', // added alpha for lovely Apple style transparency
                      }}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-lg leading-none">{selectedUnit.emoji}</span>
                        <span className="text-[9px] text-white/95 font-bold mt-0.5 leading-none">
                          {index + 1}
                        </span>
                      </div>
                      
                      {/* Interactive connector line indicator */}
                      {index < unitCount - 1 && (
                        <div className="absolute right-[-1px] top-1 bottom-1 w-0.5 bg-white/40 border-r border-dashed border-black/10" />
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

          {/* Mathematical Feedback Card */}
          <div className="mt-8 bg-slate-50 rounded-2xl p-4 border border-black/5">
            <div className="flex items-start gap-3">
              <HelpCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <div className="space-y-2">
                <h5 className="font-bold text-xs text-gray-700">생각 키우기 & 발견하기</h5>
                
                {/* Visual calculation analysis */}
                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    📌 <strong>현재까지 놓은 단위:</strong> <span>{selectedUnit.emoji} {selectedUnit.name}가 총 </span>
                    <span className="text-blue-600 font-extrabold text-sm">{unitCount}</span>개 있어요.
                  </p>
                  
                  {unitCount > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-black/5 mt-2 space-y-2">
                      <p className="font-medium text-gray-700 flex items-center gap-1">
                        👉 {selectedObject.name}의 길이는 {selectedUnit.singularName}로 약{' '}
                        <span className="text-amber-600 font-extrabold">{idealCount.toFixed(1)}</span>개 크기와 같아요.
                      </p>
                      
                      {/* Closeness Analyzer */}
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {Math.abs(differenceCm) < 0.2 ? (
                          <span className="text-green-600 font-semibold flex items-center gap-1">
                            🎉 우와! 딱 맞춰서 재어 보았어요. {selectedObject.name}의 길이는 {selectedUnit.singularName} 딱 {unitCount}개와 정확히 같아요!
                          </span>
                        ) : differenceCm > 0 ? (
                          <span>
                            {selectedUnit.singularName} <strong>{unitCount}개보다 조금 더 길어요</strong>. 이 물건을 다 덮으려면 클립이 조금 더 필요하겠네요!
                          </span>
                        ) : (
                          <span>
                            {selectedUnit.singularName} <strong>{unitCount}개보다 조금 더 짧아요</strong>. 끝선을 이미 넘었어요!
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* High level pedagogy concept */}
                  <div className="pt-2 text-[11px] text-gray-400 leading-relaxed border-t border-gray-200/60 mt-3">
                    💡 <strong>길이재기 마스터 꿀팁!</strong> 
                    <br />
                    작은 단위(예: 나무블록 2cm)를 사용해 잴 때에는 더 <strong>많은 갯수</strong>가 필요하고, 
                    큰 단위(예: 손뼘 8cm)를 사용해 잴 때에는 더 <strong>적은 갯수</strong>로 빠르게 잴 수 있어요!
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
