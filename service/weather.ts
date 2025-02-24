export interface WeatherData {
  utime: string;
  currentTemperature: number;
  currentWeatherPic: string;
  currentWeather: string;
  richu: string;
  riluo: string;
  riJianZuiGao: number;
  yeJianZuiDi: number;
  tomorrowWeather: string;
  tomorrowWeatherPic: string;
  mingRiBaiTianZuiGao: number;
  mingRiYeJianZuiDi: number;
}

export const getWeatherData = async (): Promise<WeatherData> => {
  // 添加时间戳参数防止缓存
  const timestamp = new Date().getTime();
  const response = await fetch(`/api/weather?_t=${timestamp}`, {
    cache: 'no-store',
    headers: {
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  const data = await response.json();
  return data.data;
};

