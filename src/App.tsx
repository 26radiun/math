import React from 'react';
import RulerSimulation from './components/RulerSimulation';
import { Ruler } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased flex flex-col items-center justify-start p-3 sm:p-6 select-none">
      
      {/* Dynamic Mini Header to save screen height */}
      <header className="w-full max-w-2xl bg-white rounded-2xl px-4 py-2 flex items-center justify-between border border-black/5 shadow-sm mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white">
            <Ruler className="rotate-45" size={15} />
          </div>
          <div>
            <span className="text-[9px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider block w-max">
              초등 2학년 길이재기 교실
            </span>
            <h1 className="font-black text-xs text-[#1D1D1F] tracking-tight">
              자로 똑바로 재기 📐
            </h1>
          </div>
        </div>

        <div className="text-[10px] text-gray-500 font-bold bg-gray-50 border border-gray-200/50 py-1 px-2.5 rounded-lg">
          🍎 0점을 먼저 맞추고 정답의 센티미터 단추를 눌러요!
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-2xl flex-1 flex flex-col justify-start">
        <RulerSimulation />
      </main>

    </div>
  );
}
