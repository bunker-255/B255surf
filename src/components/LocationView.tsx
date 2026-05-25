import React, { useState, useEffect } from 'react';
import { Spot, SPOTS } from '../data/spots';
import { WeatherData, fetchSpotData } from '../lib/api';
import { MapPin, Target, Settings2, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { CustomSelect } from './CustomSelect';
import { usePreferences, ActivityType } from '../hooks/usePreferences';
import { format, parseISO } from 'date-fns';
import { SpotMap } from './SpotMap';

interface LocationViewProps {
  weather: WeatherData | null;
  selectedSpot: Spot;
  onSelectSpot: (spot: Spot) => void;
  onEnableNotifications: () => void;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export function LocationView({ weather, selectedSpot, onSelectSpot, onEnableNotifications }: LocationViewProps) {
  const { lang, t } = useLanguage();
  const { prefs, updatePrefs, applyPreset } = usePreferences();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => setIsSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  const handleLocateNearest = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        let closest = SPOTS[0];
        let minDist = Infinity;
        
        SPOTS.forEach(spot => {
          const dist = getDistance(latitude, longitude, spot.lat, spot.lng);
          if (dist < minDist) {
            minDist = dist;
            closest = spot;
          }
        });
        
        onSelectSpot(closest);
      }, (error) => {
        console.warn("Geolocation error:", error);
      });
    }
  };

  const handleSaveSettings = () => {
    setIsSaved(true);
  };

  const activityOptions = [
    { value: 'custom', label: t('customData') as string },
    { value: 'sup_inflatable', label: t('sup_inflatable') as string },
    { value: 'sup_hard', label: t('sup_hard') as string },
    { value: 'surf_beginner', label: t('surf_beginner') as string },
    { value: 'surf_pro', label: t('surf_pro') as string },
    { value: 'kite_twintip', label: t('kite_twintip') as string },
    { value: 'kite_wave', label: t('kite_wave') as string },
    { value: 'windsurf', label: t('windsurf') as string },
    { value: 'wingfoil', label: t('wingfoil') as string },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto" style={{ direction: lang === 'he' ? 'rtl' : 'ltr' }}>
      
      {/* Settings Section */}
      <div className="bg-slate-800/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-slate-700/50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-700/40 pb-5">
          <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
            <Settings2 className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-xl font-display font-medium text-slate-100 tracking-tight">{t('settings')}</h3>
        </div>

        {/* Location Section */}
        <div className="space-y-4 mb-10">
           <h4 className="text-[11px] font-semibold text-slate-400 tracking-[0.2em] uppercase">{t('location')}</h4>
           <div className="flex flex-row items-center gap-3">
             <div className="flex-1 flex items-center bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 h-[56px] shadow-inner">
                <CustomSelect 
                  value={selectedSpot.id}
                  onChange={(val) => {
                    onSelectSpot(SPOTS.find(s => s.id === val) || SPOTS[0]);
                  }}
                  options={SPOTS.map(spot => ({
                    value: spot.id,
                    label: spot.name[lang]
                  }))}
                  icon={<MapPin className="text-indigo-400 w-5 h-5 flex-shrink-0" />}
                  className="text-slate-100 font-semibold px-2 w-full"
                  containerClassName="w-full"
                  dropdownClassName="left-0 mt-3"
                />
             </div>
             <button 
               onClick={handleLocateNearest}
               className="h-[56px] px-5 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-all shadow-md border border-slate-600/30 text-slate-200 whitespace-nowrap"
               title={t('nearestPola') as string}
             >
               <Target size={18} className="text-emerald-400" />
               <span className="hidden sm:inline">{t('nearestPola')}</span>
             </button>
           </div>
             
           <div className="rounded-xl overflow-hidden border border-slate-700/50 shadow-md">
             <SpotMap 
               spots={SPOTS} 
               selectedSpot={selectedSpot} 
               onSelectSpot={(spot) => {
                 onSelectSpot(spot);
               }}
               windSpeed={weather?.current.windSpeed || 0}
               windDirection={weather?.current.windDirection || 0}
             />
           </div>
        </div>

        <hr className="border-slate-700/50 my-10" />

        {/* Preferences Section */}
        <div className="space-y-6">
           <h4 className="text-[11px] font-semibold text-slate-400 tracking-[0.2em] uppercase mb-4">{t('preferences')}</h4>
           
           <div className="space-y-3">
             <label className="text-xs text-slate-400 font-medium tracking-wide">{t('pickForMe')}</label>
             <div className="flex items-center bg-slate-900/60 border border-slate-700/50 rounded-xl p-1.5 h-[56px] shadow-inner">
                <CustomSelect 
                  value={prefs.activity}
                  onChange={(val) => {
                    const activity = val as ActivityType;
                    if (activity === 'custom') {
                      updatePrefs({ activity: 'custom' });
                    } else {
                      applyPreset(activity);
                    }
                  }}
                  options={activityOptions}
                  className="text-slate-100 font-medium px-3 py-1 w-full"
                  containerClassName="w-full"
                  dropdownClassName="left-0 mt-3"
                />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
             <div className="space-y-5 bg-slate-900/40 p-5 rounded-2xl border border-slate-700/30">
                <div className="text-[11px] font-semibold text-slate-400 tracking-[0.15em] uppercase">{t('waveHeight')}</div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-400"><label>Min (m)</label><span className="text-slate-200 font-medium">{(prefs.minWave ?? 0).toFixed(1)}</span></div>
                  <input type="range" min="0" max="5" step="0.1" value={prefs.minWave} onChange={e => { updatePrefs({ activity: 'custom', minWave: Number(e.target.value) }); }} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-400"><label>Max (m)</label><span className="text-slate-200 font-medium">{(prefs.maxWave ?? 0).toFixed(1)}</span></div>
                  <input type="range" min="0" max="5" step="0.1" value={prefs.maxWave} onChange={e => { updatePrefs({ activity: 'custom', maxWave: Number(e.target.value) }); }} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
             </div>

             <div className="space-y-5 bg-slate-900/40 p-5 rounded-2xl border border-slate-700/30">
                <div className="text-[11px] font-semibold text-slate-400 tracking-[0.15em] uppercase">{t('windSpeed')}</div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-400"><label>Min (m/s)</label><span className="text-slate-200 font-medium">{prefs.minWind}</span></div>
                  <input type="range" min="0" max="60" step="1" value={prefs.minWind} onChange={e => { updatePrefs({ activity: 'custom', minWind: Number(e.target.value) }); }} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-400"><label>Max (m/s)</label><span className="text-slate-200 font-medium">{prefs.maxWind}</span></div>
                  <input type="range" min="0" max="60" step="1" value={prefs.maxWind} onChange={e => { updatePrefs({ activity: 'custom', maxWind: Number(e.target.value) }); }} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
             </div>
           </div>

           <button 
             onClick={handleSaveSettings}
             disabled={isSaved}
             className={`w-full flex items-center justify-center gap-2 py-4 mt-6 rounded-xl text-[15px] font-medium text-white transition-all border ${
               isSaved 
                 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-default' 
                 : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 border-indigo-400/20 shadow-[0_8px_20px_-8px_rgba(99,102,241,0.5)]'
             }`}
           >
             {isSaved ? (
               <>
                 <Check size={20} />
                 {t('settingsSaved')}
               </>
             ) : (
               <>
                 <Settings2 size={20} />
                 {t('saveSettings')}
               </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
}

