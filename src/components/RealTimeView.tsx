import React from 'react';
import { SpotMap } from './SpotMap';
import { CompassVisual } from './CompassVisual';
import { Spot, SPOTS } from '../data/spots';
import { WeatherData } from '../lib/api';
import { getCompassDirection } from '../lib/utils';
import { Wind, Waves, Thermometer, Navigation, BellRing, MapPin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface RealTimeViewProps {
  weather: WeatherData | null;
  selectedSpot: Spot;
  onSelectSpot: (spot: Spot) => void;
  isLoading: boolean;
  onEnableNotifications: () => void;
}

export function RealTimeView({ weather, selectedSpot, onSelectSpot, isLoading, onEnableNotifications }: RealTimeViewProps) {
  const { lang, t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
           <MapPin className="text-indigo-400 w-4 h-4" />
           <span className="text-sm font-medium text-slate-300">{selectedSpot.name[lang]}</span>
        </div>
        <button 
          onClick={onEnableNotifications}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-full transition-colors group text-xs font-semibold uppercase tracking-wider"
          title="Enable notifications for optimal conditions"
        >
          <BellRing className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">{t('optimalConditions')}</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Real-time Compass */}
        <div className="flex-1 bg-slate-800/40 p-4 sm:p-6 rounded-[2rem] border border-slate-700/50 shadow-lg flex flex-col items-center">
            {isLoading || !weather ? (
               <div className="flex-1 flex items-center justify-center min-h-[250px]">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
               </div>
            ) : (
              <CompassVisual 
                windDirection={weather.current.windDirection} 
                waveDirection={weather.current.waveDirection} 
              />
            )}
        </div>
      </div>

      {/* Metrics Grid */}
      {!isLoading && weather && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            icon={<Waves className="text-emerald-400" />}
            label={t('waveHeight')}
            value={`${(weather.current.waveHeight ?? 0).toFixed(1)} m`}
            sub={`${(weather.current.wavePeriod ?? 0).toFixed(1)}s ${t('wavePeriod')}`}
          />
          <MetricCard 
            icon={<Wind className="text-blue-400" />}
            label={t('windSpeed')}
            value={`${Math.round(weather.current.windSpeed)} m/s`}
            sub={`${t('windGusts')} ${Math.round(weather.current.windGusts)}`}
          />
          <MetricCard 
            icon={<Navigation className="text-indigo-400" />}
            label={t('direction')}
            value={t(getCompassDirection(weather.current.windDirection + 180) as any)}
            sub={t('windHeading')}
          />
          <MetricCard 
            icon={<Thermometer className="text-amber-400" />}
            label={t('temperature')}
            value={`${Math.round(weather.current.temperature)}°C`}
            sub={t('airTemp')}
          />
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, sub: string }) {
  return (
    <div className="group bg-slate-800/40 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/50 hover:border-slate-600/60 transition-colors flex flex-col gap-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-2 text-slate-400 text-[11px] font-semibold tracking-[0.15em] uppercase">
        {icon} <span>{label}</span>
      </div>
      <div className="text-3xl text-slate-50 font-display font-light tracking-tight mt-1">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{sub}</div>
    </div>
  );
}
