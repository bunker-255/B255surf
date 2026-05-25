export interface WeatherData {
  current: {
    windSpeed: number; // m/s
    windDirection: number; // degrees
    windGusts: number; // m/s
    temperature: number; // C
    waveHeight: number; // m
    waveDirection: number; // degrees
    wavePeriod: number; // s
    time: string;
  };
  hourly: {
    time: string[];
    windSpeed: number[];
    windDirection: number[];
    windGusts: number[];
    waveHeight: number[];
    waveDirection: number[];
    wavePeriod: number[];
  };
}

export async function fetchSpotData(lat: number, lng: number): Promise<WeatherData> {
  const [weatherRes, marineRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m&wind_speed_unit=ms&timezone=auto`
    ),
    fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_direction,wave_period&hourly=wave_height,wave_direction,wave_period&timezone=auto`
    )
  ]);

  if (!weatherRes.ok || !marineRes.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const weather = await weatherRes.json();
  const marine = await marineRes.json();

  return {
    current: {
      windSpeed: weather.current.wind_speed_10m,
      windDirection: weather.current.wind_direction_10m,
      windGusts: weather.current.wind_gusts_10m,
      temperature: weather.current.temperature_2m,
      waveHeight: marine.current.wave_height || 0,
      waveDirection: marine.current.wave_direction || 0,
      wavePeriod: marine.current.wave_period || 0,
      time: weather.current.time,
    },
    hourly: {
      time: weather.hourly.time,
      windSpeed: weather.hourly.wind_speed_10m,
      windDirection: weather.hourly.wind_direction_10m,
      windGusts: weather.hourly.wind_gusts_10m,
      waveHeight: marine.hourly.wave_height || new Array(weather.hourly.time.length).fill(0),
      waveDirection: marine.hourly.wave_direction || new Array(weather.hourly.time.length).fill(0),
      wavePeriod: marine.hourly.wave_period || new Array(weather.hourly.time.length).fill(0),
    }
  };
}
