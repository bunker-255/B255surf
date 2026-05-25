/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SPOTS, Spot } from './data/spots';
import { fetchSpotData, WeatherData } from './lib/api';
import { RealTimeView } from './components/RealTimeView';
import { ForecastView } from './components/ForecastView';
import { LocationView } from './components/LocationView';
import { CustomSelect, SelectOption } from './components/CustomSelect';
import { useNotifications } from './hooks/useNotifications';
import { Waves, Globe, Activity, LineChart, Settings } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';
import { Language } from './i18n/translations';

type Tab = 'realtime' | 'forecast' | 'location';

const langOptions: SelectOption[] = [
  { value: 'en', label: 'EN' },
  { value: 'ru', label: 'RU' },
  { value: 'he', label: 'HE' }
];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('realtime');
  const [selectedSpot, setSelectedSpot] = useState<Spot>(SPOTS[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { requestPermission, notify } = useNotifications();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
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
        
        setSelectedSpot(closest);
      }, (error) => {
        console.warn("Geolocation error:", error);
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSpotData(selectedSpot.lat, selectedSpot.lng);
        if (mounted) {
          setWeather(data);
          
          if (data.current.waveHeight > 0.5) {
            notify(`${t('optimalConditions')} ${selectedSpot.name[lang]}!`, {
              body: `${t('waves')}: ${(data.current.waveHeight ?? 0).toFixed(1)}m, ${t('wind')}: ${(data.current.windSpeed ?? 0).toFixed(0)} m/s`
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedSpot, lang, t]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8 h-full flex flex-col relative z-0">
        {/* Header */}
        <header className="flex flex-row items-center justify-between mb-4 sm:mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 p-2 sm:p-3 rounded-2xl hidden sm:block border border-indigo-500/10 shadow-[inset_0_1px_rgba(255,255,255,0.05)]">
              <Waves className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-light tracking-tight">{t('appTitle')}<span className="font-semibold text-indigo-400 tracking-normal"> {t('appSubtitle')}</span></h1>
              <p className="text-[10px] sm:text-sm text-slate-400 font-medium tracking-wider uppercase hidden sm:block mt-1">{t('appDesc')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Tab Navigation */}
            <div className="hidden md:flex bg-slate-800/50 p-1.5 rounded-full border border-slate-700/50">
              <button
                onClick={() => setActiveTab('realtime')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'realtime' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {t('realTime')}
              </button>
              <button
                onClick={() => setActiveTab('forecast')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'forecast' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {t('forecast')}
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'location' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {t('settings')}
              </button>
            </div>

            <div className="flex items-center bg-slate-800/50 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-700/50 w-auto">
              <CustomSelect
                value={lang}
                onChange={(val) => setLang(val as Language)}
                options={langOptions}
                icon={<Globe className="w-4 h-4 text-slate-400 hidden sm:block" />}
                className="text-slate-300 text-sm font-medium focus:outline-none min-w-[3rem]"
                dropdownClassName="right-0 mt-3"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-24 md:pb-8 flex flex-col">
          <div className="flex-1 relative">
            {activeTab === 'realtime' ? (
              <RealTimeView 
                weather={weather} 
                selectedSpot={selectedSpot} 
                onSelectSpot={setSelectedSpot} 
                isLoading={isLoading}
                onEnableNotifications={requestPermission}
              />
            ) : activeTab === 'forecast' ? (
              <ForecastView weather={weather} isLoading={isLoading} />
            ) : (
              <LocationView
                weather={weather}
                selectedSpot={selectedSpot}
                onSelectSpot={setSelectedSpot}
                onEnableNotifications={requestPermission}
              />
            )}
          </div>
          
          <div className="mt-8 mb-4 md:mb-0 text-center text-xs text-slate-500/80 font-medium tracking-wide pointer-events-auto">
            Promoted by <a href="https://bunker-255.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400/80 hover:text-indigo-300 transition-colors">bunker-255.com</a>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] safe-area-bottom">
        <button onClick={() => window.scrollTo(0, 0) || setActiveTab('realtime')} className={`flex flex-col items-center gap-1.5 px-4 py-1 transition-colors ${activeTab === 'realtime' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide uppercase">{t('realTime')}</span>
        </button>
        <button onClick={() => window.scrollTo(0, 0) || setActiveTab('forecast')} className={`flex flex-col items-center gap-1.5 px-4 py-1 transition-colors ${activeTab === 'forecast' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
          <LineChart className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide uppercase">{t('forecast')}</span>
        </button>
        <button onClick={() => window.scrollTo(0, 0) || setActiveTab('location')} className={`flex flex-col items-center gap-1.5 px-4 py-1 transition-colors ${activeTab === 'location' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide uppercase">{t('settings')}</span>
        </button>
      </div>
    </div>
  );
}
