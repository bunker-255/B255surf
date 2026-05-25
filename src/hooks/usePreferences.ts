import { useState, useEffect } from 'react';

export type ActivityType = 'custom' | 'sup_inflatable' | 'sup_hard' | 'surf_beginner' | 'surf_pro' | 'kite_twintip' | 'kite_wave' | 'windsurf' | 'wingfoil';

export interface Preferences {
  activity: ActivityType;
  minWave: number;
  maxWave: number;
  minWind: number;
  maxWind: number;
}

export const ACTIVITY_PRESETS: Record<Exclude<ActivityType, 'custom'>, Omit<Preferences, 'activity'>> = {
  sup_inflatable: { minWave: 0, maxWave: 0.4, minWind: 0, maxWind: 15 },
  sup_hard: { minWave: 0, maxWave: 0.8, minWind: 0, maxWind: 18 },
  surf_beginner: { minWave: 0.4, maxWave: 1.2, minWind: 0, maxWind: 15 },
  surf_pro: { minWave: 1.0, maxWave: 3.0, minWind: 0, maxWind: 20 },
  kite_twintip: { minWave: 0, maxWave: 2.0, minWind: 25, maxWind: 45 },
  kite_wave: { minWave: 0.8, maxWave: 3.0, minWind: 25, maxWind: 40 },
  windsurf: { minWave: 0, maxWave: 2.0, minWind: 30, maxWind: 50 },
  wingfoil: { minWave: 0, maxWave: 1.5, minWind: 20, maxWind: 40 },
};

const DEFAULT_PREFS: Preferences = {
  ...ACTIVITY_PRESETS['surf_beginner'],
  activity: 'surf_beginner'
};

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(() => {
    const saved = localStorage.getItem('surf_prefs');
    return saved ? JSON.parse(saved) : DEFAULT_PREFS;
  });

  useEffect(() => {
    localStorage.setItem('surf_prefs', JSON.stringify(prefs));
  }, [prefs]);

  const updatePrefs = (updates: Partial<Preferences>) => {
    setPrefs(prev => ({ ...prev, ...updates }));
  };

  const applyPreset = (activity: Exclude<ActivityType, 'custom'>) => {
    setPrefs({
      activity,
      ...ACTIVITY_PRESETS[activity]
    });
  };

  return { prefs, updatePrefs, applyPreset };
}
