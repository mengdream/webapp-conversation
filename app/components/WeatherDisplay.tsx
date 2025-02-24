import { useEffect, useState } from 'react';
import { WeatherData, getWeatherData } from '@/service/weather';
import WeatherCard from './WeatherCard';

export default function WeatherDisplay() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeatherData();
        setWeather(data);
      } catch (err) {
        setError('获取天气信息失败');
        console.error('Failed to fetch weather data:', err);
      }
    };

    fetchWeather();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!weather) {
    return <div className="animate-pulse">加载天气信息中...</div>;
  }

  return <WeatherCard data={weather} />;
}
