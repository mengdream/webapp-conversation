import { WeatherData, getWeatherData } from '@/service/weather';
import Image from 'next/image';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

function getLocalWeatherIcon(url: string) {
  // 从 URL 中提取 day/01.png 这样的路径
  const match = url.match(/([^/]+\/\d+\.png)$/);
  if (!match) return '/images/weather-icon/day/undefined.png';

  return `/images/weather-icon/${match[1]}`;
}

export default function WeatherCard() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weatherData = await getWeatherData();
        setData(weatherData);
        setError(null);
      } catch (err) {
        setError('获取天气数据失败');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto">
      {/* Today's Weather */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-500 text-sm">
            半山天气预报 {format(new Date(data.utime), 'MM-dd HH:mm')} 更新
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{data.currentTemperature}°</span>
            <span className="text-lg text-gray-700">{data.currentWeather}</span>
          </div>
          <div className="mt-1">
            <span className="text-sm text-gray-600">
              ↑{data.riJianZuiGao}° ↓{data.yeJianZuiDi}°
            </span>
          </div>
        </div>
        <div>
          <Image
            src={getLocalWeatherIcon(data.currentWeatherPic)}
            alt="Current Weather"
            width={64}
            height={64}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Tomorrow's Weather */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">明天</p>
          <p className="text-sm text-gray-600 mt-1">
            {data.tomorrowWeather}
          </p>
          <p className="text-sm text-gray-600">
            ↑{data.mingRiBaiTianZuiGao}° ↓{data.mingRiYeJianZuiDi}°
          </p>
        </div>
        <Image
          src={getLocalWeatherIcon(data.tomorrowWeatherPic)}
          alt="Tomorrow Weather"
          width={40}
          height={40}
        />
      </div>
    </div>
  );
}
