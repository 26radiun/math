import React from 'react';
import RulerSimulation from './components/RulerSimulation';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans antialiased flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center">
        <RulerSimulation />
      </main>
    </div>
  );
}
