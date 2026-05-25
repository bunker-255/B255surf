import React, { useState, useMemo, useEffect } from 'react';
import { WeatherData } from '../lib/api';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { format, parseISO, startOfDay, getHours } from 'date-fns';
import { enUS, ru, he } from 'date-fns/locale';
import { Waves, Wind, ArrowUp, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { usePreferences } from '../hooks/usePreferences';
import { getCompassDirection } from '../lib/utils';

interface ForecastViewProps {
  weather: WeatherData | null;
  isLoading: boolean;
}

interface HourlyData {
  time: Date;
  formattedTime: string;
  hour: string;
  hourNum: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
}

interface ChunkData {
  id: number;
  nameKey: 'night' | 'morning' | 'afternoon' | 'evening';
  hoursStr: string;
  maxWave: number;
  maxWind: number;
  hasOptimal: boolean;
}

interface DailySummary {
  date: Date;
  dateStr: string;
  dayName: string;
  dayShort: string;
  monthDay: string;
  maxWaveHeight: number;
  maxWindSpeed: number;
  avgWaveDirection: number;
  hourly: HourlyData[];
  chunks: ChunkData[];
}

const locales: Record<Language, Locale> = {
  en: enUS,
  ru: ru,
  he: he
};

const CHUNK_MAP: Record<number, { key: 'night' | 'morning' | 'afternoon' | 'evening', str: string }> = {
  0: { key: 'night', str: '00:00 - 06:00' },
  1: { key: 'morning', str: '06:00 - 12:00' },
  2: { key: 'afternoon', str: '12:00 - 18:00' },
  3: { key: 'evening', str: '18:00 - 00:00' }
};

export function ForecastView({ weather, isLoading }: ForecastViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { lang, t } = useLanguage();
  const { prefs } = usePreferences();

  const isOptimal = (wave: number, wind: number) => {
    return wave >= prefs.minWave && wave <= prefs.maxWave &&
           wind >= prefs.minWind && wind <= prefs.maxWind;
  };

  const dailyForecasts = useMemo(() => {
    if (!weather) return [];
    
    const daysMap = new Map<string, DailySummary>();
    const locale = locales[lang];
    
    weather.hourly.time.forEach((timeStr, idx) => {
      const date = parseISO(timeStr);
      const dateKey = startOfDay(date).toISOString();
      const hNum = getHours(date);
      const hourData: HourlyData = {
        time: date,
        formattedTime: format(date, 'EEE HH:mm', { locale }),
        hour: format(date, 'HH:mm', { locale }),
        hourNum: hNum,
        windSpeed: weather.hourly.windSpeed[idx] || 0,
        windGusts: weather.hourly.windGusts[idx] || 0,
        windDirection: weather.hourly.windDirection[idx] || 0,
        waveHeight: weather.hourly.waveHeight[idx] || 0,
        waveDirection: weather.hourly.waveDirection[idx] || 0,
        wavePeriod: weather.hourly.wavePeriod[idx] || 0,
      };

      if (!daysMap.has(dateKey)) {
        daysMap.set(dateKey, {
          date: startOfDay(date),
          dateStr: dateKey,
          dayName: format(date, 'EEEE, MMM d', { locale }),
          dayShort: format(date, 'EEE', { locale }),
          monthDay: format(date, 'MMM d', { locale }),
          maxWaveHeight: hourData.waveHeight,
          maxWindSpeed: hourData.windSpeed,
          avgWaveDirection: hourData.waveDirection,
          hourly: [hourData],
          chunks: []
        });
      } else {
        const day = daysMap.get(dateKey)!;
        day.hourly.push(hourData);
        day.maxWaveHeight = Math.max(day.maxWaveHeight, hourData.waveHeight);
        day.maxWindSpeed = Math.max(day.maxWindSpeed, hourData.windSpeed);
      }
    });

    // Populate chunks
    const daysArr = Array.from(daysMap.values()).slice(0, 7);
    daysArr.forEach(day => {
      for (let i = 0; i < 4; i++) {
        const chunkHours = day.hourly.filter(h => Math.floor(h.hourNum / 6) === i);
        if (chunkHours.length > 0) {
          day.chunks.push({
            id: i,
            nameKey: CHUNK_MAP[i].key,
            hoursStr: CHUNK_MAP[i].str,
            maxWave: Math.max(...chunkHours.map(h => h.waveHeight)),
            maxWind: Math.max(...chunkHours.map(h => h.windSpeed)),
            hasOptimal: chunkHours.some(h => isOptimal(h.waveHeight, h.windSpeed))
          });
        }
      }
    });

    return daysArr;
  }, [weather, lang, prefs]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    return dailyForecasts.find(d => d.dateStr === selectedDate) || dailyForecasts[0];
  }, [selectedDate, dailyForecasts]);

  const chartData = useMemo(() => {
    if (!selectedDayData) return [];
    return selectedDayData.hourly.filter((_, i) => i % 3 === 0);
  }, [selectedDayData]);

  const [selectedHour, setSelectedHour] = useState<HourlyData | null>(null);

  if (isLoading || !weather) {
    return (
       <div className="flex-1 flex items-center justify-center min-h-[400px]">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
       </div>
    );
  }

  // List View
  if (!selectedDate) {
    return (
      <div className="max-w-2xl mx-auto space-y-6" style={{ direction: lang === 'he' ? 'rtl' : 'ltr' }}>
        <div className="text-sm text-slate-400 text-center uppercase tracking-widest mb-4">
          {t('selectDayForecast')}
        </div>
        {dailyForecasts.map(day => (
          <div key={day.dateStr} className="bg-slate-800/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]">
             <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-b border-slate-700/50 text-sm font-semibold text-slate-200 capitalize tracking-wide">
                {day.dayName}
             </div>
             <div className="divide-y divide-slate-700/30">
               {day.chunks.map(chunk => (
                 <button 
                   key={chunk.id} 
                   onClick={() => {
                     setSelectedDate(day.dateStr);
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}
                   className={`w-full flex items-center justify-between p-4.5 hover:bg-slate-700/30 transition-all duration-200 group ${lang === 'he' ? 'text-right' : 'text-left'} ${chunk.hasOptimal ? 'bg-indigo-500/5' : ''}`}
                 >
                   <div className="flex flex-col gap-1">
                     <span className="flex items-center gap-2 text-[15px] font-medium text-slate-300 capitalize group-hover:text-indigo-300 transition-colors">
                       {t(chunk.nameKey)}
                       {chunk.hasOptimal && <CheckCircle2 className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />}
                     </span>
                     <span className="text-[11px] text-slate-500 font-mono tracking-widest">{chunk.hoursStr}</span>
                   </div>
                   <div className="flex gap-6 items-center">
                      <div className="flex flex-col items-center gap-1 w-12">
                        <Waves className="w-5 h-5 text-emerald-400/80 group-hover:text-emerald-400 transition-colors" />
                        <span className="text-xs font-semibold text-slate-300">{(chunk.maxWave ?? 0).toFixed(1)}m</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 w-12">
                        <Wind className="w-5 h-5 text-blue-400/80 group-hover:text-blue-400 transition-colors" />
                        <span className="text-xs font-semibold text-slate-300">{Math.round(chunk.maxWind)}</span>
                      </div>
                      {lang === 'he' ? <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" /> : <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />}
                   </div>
                 </button>
               ))}
             </div>
          </div>
        ))}
      </div>
    );
  }

  // Detail View
  return (
    <div className="space-y-6" style={{ direction: lang === 'he' ? 'rtl' : 'ltr' }}>
      {selectedDayData && (
        <div className="bg-slate-800/40 backdrop-blur-md p-5 md:p-8 rounded-[2rem] border border-slate-700/50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-8 border-b border-slate-700/40 pb-5">
            <button 
              onClick={() => setSelectedDate(null)}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors uppercase tracking-widest"
            >
              {lang === 'he' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              {t('back')}
            </button>
            <h2 className="text-xl font-display font-medium text-slate-100 capitalize tracking-tight">{selectedDayData.dayName}</h2>
          </div>
          
          {/* Charts for the selected day */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
             <div className="space-y-4">
                <div className="text-[11px] font-semibold text-slate-400 tracking-[0.2em] uppercase bg-slate-900/60 inline-block px-4 py-1.5 rounded-full shadow-inner border border-slate-800/50">{t('windForecast')}</div>
                <div className="h-64 bg-slate-900/40 rounded-2xl p-4 border border-slate-700/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]" style={{ direction: 'ltr' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="windColorDay" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="hour" stroke="#475569" fontSize={11} tickMargin={12} fontFamily="monospace" />
                      <YAxis stroke="#475569" fontSize={11} tickMargin={12} fontFamily="monospace" orientation={lang === 'he' ? 'right' : 'left'} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #334155', borderRadius: '12px', color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#818CF8' }}
                      />
                      <Area type="monotone" dataKey="windSpeed" stroke="#818CF8" strokeWidth={3} fillOpacity={1} fill="url(#windColorDay)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
             <div className="space-y-4">
                <div className="text-[11px] font-semibold text-slate-400 tracking-[0.2em] uppercase bg-slate-900/60 inline-block px-4 py-1.5 rounded-full shadow-inner border border-slate-800/50">{t('waveHeight')} (m)</div>
                <div className="h-64 bg-slate-900/40 rounded-2xl p-4 border border-slate-700/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]" style={{ direction: 'ltr' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="waveColorDay" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="hour" stroke="#475569" fontSize={11} tickMargin={12} fontFamily="monospace" />
                      <YAxis stroke="#475569" fontSize={11} tickMargin={12} fontFamily="monospace" orientation={lang === 'he' ? 'right' : 'left'} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #334155', borderRadius: '12px', color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#34D399' }}
                      />
                      <Area type="monotone" dataKey="waveHeight" stroke="#34D399" strokeWidth={3} fillOpacity={1} fill="url(#waveColorDay)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* Hourly Details */}
          <div className="space-y-0 border border-slate-700 rounded-xl overflow-hidden shadow-inner bg-slate-900/30">
            <div className={`grid grid-cols-4 md:grid-cols-7 gap-4 px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/80 border-b border-slate-700 ${lang === 'he' ? 'text-right' : 'text-left'}`}>
               <div>{t('time')}</div>
               <div>{t('wave')}</div>
               <div className="hidden md:block">{t('waveDir')}</div>
               <div className="hidden md:block">{t('period')}</div>
               <div>{t('wind')}</div>
               <div className="hidden md:block">{t('gusts')}</div>
               <div>{t('windDir')}</div>
            </div>
            
            <div className="flex flex-col max-h-[500px] overflow-y-auto">
              {selectedDayData.hourly.map((h, i) => {
                 const optimal = isOptimal(h.waveHeight, h.windSpeed);
                 return (
                 <React.Fragment key={i}>
                   <div 
                     onClick={() => setSelectedHour(selectedHour === h ? null : h)}
                     className={`grid grid-cols-4 md:grid-cols-7 gap-4 px-4 py-3 items-center text-sm transition-colors cursor-pointer group ${lang === 'he' ? 'text-right' : 'text-left'} ${
                       selectedHour === h ? 'bg-indigo-500/10' : (optimal ? 'hover:bg-slate-800/80 bg-indigo-500/5' : 'hover:bg-slate-800/40')
                     } ${i !== 0 ? 'border-t border-slate-800' : ''}`}
                   >
                     <div className="font-medium text-slate-300 flex items-center gap-1.5">
                       {optimal && <CheckCircle2 className="w-3 h-3 text-indigo-400 hidden sm:block" />}
                       {h.hour}
                     </div>
                     <div className="text-emerald-400 font-semibold">{(h.waveHeight ?? 0).toFixed(1)}m</div>
                     <div className="hidden md:flex items-center gap-1 text-slate-400">
                       <ArrowUp size={14} style={{ transform: `rotate(${h.waveDirection + 180}deg)` }} /> <span dir="ltr">{t(getCompassDirection(h.waveDirection + 180) as any)}</span>
                     </div>
                     <div className="hidden md:block text-slate-400">{(h.wavePeriod ?? 0).toFixed(1)}s</div>
                     
                     <div className="text-blue-400 font-semibold">{Math.round(h.windSpeed)}</div>
                     <div className="hidden md:block text-slate-400">{Math.round(h.windGusts)}</div>
                     <div className="flex items-center gap-1 text-slate-400">
                       <ArrowUp size={14} style={{ transform: `rotate(${h.windDirection + 180}deg)` }} /> <span dir="ltr">{t(getCompassDirection(h.windDirection + 180) as any)}</span>
                     </div>
                   </div>
                   
                   {/* Mobile details expansion on tap */}
                   {selectedHour === h && (
                     <div className={`md:hidden grid grid-cols-2 gap-4 px-4 py-4 bg-indigo-500/5 text-xs shadow-inner ${lang === 'he' ? 'text-right' : 'text-left'}`}>
                        <div>
                          <div className="text-slate-500 mb-1 uppercase tracking-wider">{t('waveDir')}</div>
                          <div className="flex items-center gap-2 text-slate-300 font-medium">
                            <ArrowUp size={14} style={{ transform: `rotate(${h.waveDirection + 180}deg)`, color: '#34D399' }} /> <span dir="ltr">{t(getCompassDirection(h.waveDirection + 180) as any)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1 uppercase tracking-wider">{t('period')}</div>
                          <div className="text-slate-300 font-medium">{(h.wavePeriod ?? 0).toFixed(1)}s</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1 uppercase tracking-wider">{t('gusts')}</div>
                          <div className="text-slate-300 font-medium">{Math.round(h.windGusts)} m/s</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1 uppercase tracking-wider">{t('windDir')}</div>
                          <div className="flex items-center gap-2 text-slate-300 font-medium">
                            <ArrowUp size={14} style={{ transform: `rotate(${h.windDirection + 180}deg)`, color: '#60A5FA' }} /> <span dir="ltr">{t(getCompassDirection(h.windDirection + 180) as any)}</span>
                          </div>
                        </div>
                     </div>
                   )}
                 </React.Fragment>
                 )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
