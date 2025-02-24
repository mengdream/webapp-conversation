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
  const response = await fetch('/api/weather');
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  const data = await response.json();
  return data.data;
};

