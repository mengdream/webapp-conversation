import { NextResponse } from 'next/server';

export async function GET() {
  const weatherUrl = process.env.NEXT_PUBLIC_WEATHER_URL;
  const appKey = process.env.NEXT_PUBLIC_WEATHER_APP_KEY;
  const sign = process.env.NEXT_PUBLIC_WEATHER_SIGN;
  const worksheetId = process.env.NEXT_PUBLIC_WEATHER_WORKSHEET_ID;
  const rowId = process.env.NEXT_PUBLIC_WEATHER_ROW_ID;

  try {
    const response = await fetch(
      `${weatherUrl}api/v2/open/worksheet/getRowById?appKey=${appKey}&sign=${sign}&worksheetId=${worksheetId}&rowId=${rowId}`
    );

    if (!response.ok) {
      throw new Error('Weather API response was not ok');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
