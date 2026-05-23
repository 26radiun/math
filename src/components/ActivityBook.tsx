import React, { useState } from 'react';
import { SavedRecord } from '../types';
import { playClickSound, playClearSound } from '../utils/audio';
import { Printer, BookOpen, Trash2, Edit3, Award, Sparkles, Smile, RefreshCw } from 'lucide-react';

interface ActivityBookProps {
  records: SavedRecord[];
  onClearRecords: () => void;
  onRemoveRecord: (id: string) => void;
}

export default function ActivityBook({ records, onClearRecords, onRemoveRecord }: ActivityBookProps) {
  const [studentSelfName, setStudentSelfName] = useState<string>('꼬마 과학자');
  const [stampRating, setStampRating] = useState<'A' | 'B' | 'C'>('C');
  const [overallReview, setOverallReview] = useState<string>('');

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  const setRating = (grade: 'A' | 'B' | 'C') => {
    setStampRating(grade);
    playClickSound();
  };

  const textPlaceholderReview = "예: 처음에는 자 눈금을 0에 맞추는 게 어색했지만, 손가락으로 자를 밀어서 딱 0점에 맞췄을 때 찰칵 소리가 나면서 참 재미있었어요!";

  return (
    <div id="activity-length-book" className="space-y-8 w-full max-w-5xl mx-auto">
      
      {/* Printable Diary Layout Wrapping Container */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-black/5 shadow-xl print:shadow-none print:border-none print:p-0 space-y-8">
        
        {/* Printable/Save PDF Action Header - Hidden during actual print */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-yellow-400 text-white rounded-xl shadow-sm">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-800 text-md">나만의 길이 돋보기 탐험 책</h3>
              <p className="text-xs text-gray-400">내가 자로 잰 물건들과 배운 점을 모아 멋진 리포트로 저장해요!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                id="btn-clear-all-records"
                onClick={() => {
                  if (confirm("모든 한줄 조사를 비우시겠습니까?")) {
                    onClearRecords();
                    playClearSound();
                  }
                }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition"
              >
                <Trash2 size={13} />
                모두 지우기
              </button>
            )}
            
            <button
              id="btn-print-length-book"
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <Printer size={13} />
              인쇄 또는 PDF 저장하기
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Book Front cover styling */}
        <div className="bg-gradient-to-tr from-slate-50 to-amber-50/20 rounded-2xl p-6 md:p-8 border border-black/5 relative overflow-hidden">
          
          <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
          
          {/* Notebook binder visual ring effect on print pages */}
          <div className="absolute top-0 bottom-0 left-4 w-1 flex flex-col justify-around py-4 opacity-40 print:hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full border border-gray-400 bg-white shadow-inner -ml-1.5" />
            ))}
          </div>

          <div className="pl-6 space-y-4 md:space-y-6">
            
            {/* Header info badge */}
            <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 rounded-full py-0.5 px-3 border border-amber-200/50">
              <Award size={12} className="fill-amber-600 stroke-none" />
              <span className="text-[10px] font-bold">초등 2학년 수학 교과 연계</span>
            </div>

            {/* Custom Input Title with neat minimal line */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">BOOK TITLE</span>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  id="input-book-student-name"
                  type="text"
                  value={studentSelfName}
                  onChange={(e) => setStudentSelfName(e.target.value)}
                  placeholder="내 이름"
                  className="font-black text-2xl text-blue-600 bg-transparent border-b-2 border-blue-400/50 pb-1 w-44 tracking-tight focus:outline-none focus:border-blue-600 transition"
                />
                <h1 className="font-extrabold text-gray-800 text-2xl tracking-tight leading-none">
                  작가의 대단한 길이재기 탐험일지 📔
                </h1>
              </div>
            </div>

            {/* General student stats review info bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-dashed border-gray-200/80">
              <div>
                <dt className="text-[10px] text-gray-400 font-extrabold">조사일시</dt>
                <dd className="text-xs font-semibold text-gray-700">오늘</dd>
              </div>
              <div>
                <dt className="text-[10px] text-gray-400 font-extrabold">조사한 물건 갯수</dt>
                <dd className="text-xs font-black text-blue-600">{records.length}개 완료</dd>
              </div>
              <div>
                <dt className="text-[10px] text-gray-400 font-extrabold">나의 탐험 훈장</dt>
                <dd className="text-xs font-semibold text-gray-700 flex items-center gap-1 mt-0.5">
                  <span className="text-sm">🌟</span> 
                  {records.length > 5 ? '마스터 자의 달인' : records.length >= 2 ? '길이 꿈나무' : '초보 조사원'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-gray-400 font-extrabold">스스로 평가</dt>
                <dd className="flex items-center gap-1.5 mt-1">
                  {(['A', 'B', 'C'] as const).map((grade) => (
                    <button
                      key={grade}
                      id={`btn-stamp-${grade}`}
                      onClick={() => setRating(grade)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded transition duration-200 print:hidden ${
                        stampRating === grade 
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white text-gray-500 border border-black/5 hover:bg-gray-100'
                      }`}
                    >
                      {grade === 'A' ? '참 잘했어요' : grade === 'B' ? '잘했어요' : '노력해요'}
                    </button>
                  ))}
                  {/* Print friendly Rating display */}
                  <span className="hidden print:inline text-xs font-bold text-amber-600">
                    {stampRating === 'A' ? '참 잘했어요 (⭐ A)' : stampRating === 'B' ? '잘했어요 (⭐ B)' : '노력해요 (⭐ C)'}
                  </span>
                </dd>
              </div>
            </div>

          </div>

        </div>

        {/* Saved Cards Stickers Layout */}
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="font-extrabold text-sm text-gray-700 flex items-center gap-1.5">
              <span>🗂️ 물건 한알한알 조사 기록 카드</span>
              <span className="text-xs font-semibold text-gray-400">({records.length}개 누적)</span>
            </h4>
            <span className="text-[10px] text-gray-400 block print:hidden">각 카드의 우측 휴지통을 누르면 카드가 개별 삭제됩니다.</span>
          </div>

          {records.length === 0 ? (
            /* Helpful empty visual encourage card */
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center space-y-3">
              <div className="text-4xl">🦉</div>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                "앗! 아직 길이 탐험 일지책에 저장된 물건 카드가 없어요. 
                위의 <strong>[📏 자로 정확하게 재기] 탭</strong>에서 관심 있는 사물들을 잰 뒤 
                <strong>'길이책에 저장'</strong>을 꾹 눌러보세요!"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.map((rec) => {
                const diffLabel = rec.differenceCm === 0 
                  ? '정확히 맞췄어요!' 
                  : `오차 ${rec.differenceCm.toFixed(1)}cm`;
                
                return (
                  <div 
                    key={rec.id}
                    className="bg-gray-50/50 rounded-xl p-4 border border-black/5 relative hover:shadow-md transition duration-300 flex flex-col justify-between"
                  >
                    {/* Floating Delete button */}
                    <button
                      id={`btn-del-rec-${rec.id}`}
                      onClick={() => {
                        onRemoveRecord(rec.id);
                        playClearSound();
                      }}
                      title="이 기록 삭제하기"
                      className="absolute top-3 right-3 text-gray-300 hover:text-red-500 rounded p-1 transition print:hidden"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div>
                      {/* Name Card Header with Emoji */}
                      <div className="flex items-center gap-2 mb-2 bg-white/70 rounded-lg p-1.5 w-max">
                        <span className="text-2xl">{rec.objectEmoji}</span>
                        <div className="text-xs font-black text-gray-800">{rec.objectName}</div>
                      </div>

                      {/* Content Comparison Grid */}
                      <div className="grid grid-cols-3 gap-2 text-[11px] mb-3 border-y border-dashed border-gray-200/60 py-2.5">
                        <div className="text-center font-medium">
                          <span className="text-gray-400 block text-[9px] leading-tight">내 어림짐작</span>
                          <span className="text-amber-600 font-extrabold">{rec.estimatedCm} cm</span>
                        </div>
                        <div className="text-center font-medium border-x border-gray-200/60">
                          <span className="text-gray-400 block text-[9px] leading-tight">자로 잰 길이</span>
                          <span className="text-blue-600 font-bold">{rec.measuredCm} cm</span>
                        </div>
                        <div className="text-center font-medium">
                          <span className="text-gray-400 block text-[9px] leading-tight">오차 차이</span>
                          <span className="text-slate-500">{rec.differenceCm.toFixed(1)} cm</span>
                        </div>
                      </div>

                      {/* Dynamic comment */}
                      <p className="text-[11.5px] text-gray-600 bg-white/80 p-2.5 rounded-lg leading-relaxed italic">
                        "{rec.studentNote}"
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400">
                      <span>{rec.unitNotes || '정확히 자질 완료!'}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Summary Review Text-area */}
        <div className="border-t border-gray-100 pt-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 text-sm">💡</span>
            <label className="text-xs font-extrabold text-gray-700 block">
              활동을 마치며: 2학년 탐정님, 오늘 배운 내용을 스스로 정리해 보아요!
            </label>
          </div>

          <textarea
            id="text-book-overall-reflection"
            rows={3}
            value={overallReview}
            onChange={(e) => setOverallReview(e.target.value)}
            placeholder={textPlaceholderReview}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-gray-400 leading-relaxed"
          />

          <div className="p-4 bg-amber-50/50 rounded-xl text-[11px] text-amber-800 leading-relaxed space-y-1">
            <p className="font-bold flex items-center gap-1">
              <span>🌾 교실이나 집에서도 할 수 있는 추가 놀이 (7~8차시 연계)</span>
            </p>
            <p>
              1. 내 <strong>손뼘</strong>이나 <strong>한 귀퉁이</strong>의 길이를 먼저 자로 재어 기억해 두어요. (예: 내 손뼘은 10cm 등)
              <br />
              2. 주변 물건(책상 높이, 리모컨 등)을 보고 "이건 내 손뼘 몇 배쯤이니까 얼마일 거야!" 하고 <strong>어림</strong>해 보세요. 그리고 자로 정확하게 재서 어림한 값과 비교해 보세요!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
