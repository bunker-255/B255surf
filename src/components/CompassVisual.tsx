import React from 'react';
import { useCompass } from '../hooks/useCompass';
import { useLanguage } from '../i18n/LanguageContext';

interface CompassVisualProps {
  windDirection: number;
  waveDirection: number;
}

export function CompassVisual({ windDirection, waveDirection }: CompassVisualProps) {
  const { heading, isAvailable, requestPermission } = useCompass();
  const { lang, t } = useLanguage();

  // If heading is available, the compass base rotates by -heading 
  // so North is always aligned with global North. 
  // If not, North is up (0).
  const compassRotation = isAvailable && heading !== null ? -heading : 0;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Legend */}
      <div className="absolute top-2 w-full flex justify-between px-6 z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
          <span className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">{t('wind')}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm shadow-sm">
          <span className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">{t('wave')}</span>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        </div>
      </div>

      {/* Compass background */}
      <div 
        className="relative w-64 h-64 rounded-full border-4 border-slate-700 bg-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center transition-transform duration-500 ease-out"
        style={{ transform: `rotate(${compassRotation}deg)` }}
      >
        {/* N / S / E / W markers */}
        <div className="absolute top-2 text-slate-400 font-bold text-sm">N</div>
        <div className="absolute bottom-2 text-slate-400 font-bold text-sm">S</div>
        <div className="absolute right-2 text-slate-400 font-bold text-sm">E</div>
        <div className="absolute left-2 text-slate-400 font-bold text-sm">W</div>
        
        {/* Inner markings */}
        <div className="absolute w-52 h-52 rounded-full border border-slate-700/50" />
        
        {/* Wind Indicator Needle (Points towards the origin) */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 pointer-events-none"
          style={{ transform: `rotate(${windDirection + 180}deg)` }}
        >
          {/* Needle Line */}
          <div className="absolute h-[60px] w-0.5 bg-gradient-to-t from-transparent to-blue-400/80" style={{ top: '22%' }} />
          {/* Needle Head */}
          <div className="absolute border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" style={{ top: '21%' }} />
        </div>

        {/* Wave Indicator Needle (Points towards the origin) */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 pointer-events-none"
          style={{ transform: `rotate(${waveDirection + 180}deg)` }}
        >
          {/* Needle Line */}
          <div className="absolute h-[80px] w-1 bg-gradient-to-t from-transparent to-emerald-400/80" style={{ top: '30%' }} />
          {/* Needle Head */}
          <div className="absolute border-l-[7px] border-r-[7px] border-b-[12px] border-l-transparent border-r-transparent border-b-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" style={{ top: '28%' }} />
        </div>
        
        {/* Center pivot point */}
        <div className="absolute w-4 h-4 bg-slate-800 border-2 border-slate-500 rounded-full z-10 shadow-lg" />
      </div>

      {!isAvailable && (
        <button 
          onClick={requestPermission}
          className="mt-6 text-xs text-slate-400 hover:text-slate-200 underline"
        >
          {t('enableCompass')}
        </button>
      )}
    </div>
  );
}
