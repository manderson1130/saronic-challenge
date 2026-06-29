import { useState, useEffect } from "react";
import type { HourlyForecast, DailySummary } from "@/types";
import { categorizeDay } from "@/lib/thresholds";


const LATITUDE = 30.3674
const LONGITUDE = -89.0928

// Weather forecast API — returns wind speed, precipitation, and visibility
const WEATHER_API_URL =
  `https://api.open-meteo.com/v1/forecast?` +
  `latitude=${LATITUDE}&longitude=${LONGITUDE}` +
  `&hourly=wind_speed_10m,precipitation,visibility` +
  `&wind_speed_unit=kn` +
  `&forecast_days=10`;

// Marine forecast API — returns wave height
const MARINE_API_URL =
  `https://marine-api.open-meteo.com/v1/marine?` +
  `latitude=${LATITUDE}&longitude=${LONGITUDE}` +
  `&hourly=wave_height` +
  `&forecast_days=10`;


// These interfaces are separate from the other types since we will transform the raw responses to fit the other models
interface WeatherApiResponse {
  hourly: {
    time: string[];
    wind_speed_10m: (number | null)[];
    precipitation: (number | null)[];
    visibility: (number | null)[];
  };
}

interface MarineApiResponse {
  hourly: {
    time: string[];
    wave_height: (number | null)[];
  };
}

interface UseWeatherDataReturn {
  data: DailySummary[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

// Merges weather and marine API responses into a single array of HourlyForecast
// objects. Both APIs return parallel arrays indexed by time, so we zip them
// together using the time array as the key.
function mergeHourlyData(
  weather: WeatherApiResponse,
  marine: MarineApiResponse
): HourlyForecast[] {
  return weather.hourly.time.map((datetime, index) => ({
    datetime,
    wind_speed: weather.hourly.wind_speed_10m[index],
    precipitation: weather.hourly.precipitation[index],
    visibility: weather.hourly.visibility[index],
    // Marine API may have fewer entries than weather API in edge cases
    wave_height: marine.hourly.wave_height[index] ?? null,
  }));
}

// Groups a flat array of HourlyForecast into a map keyed by date string
// (e.g. "2026-06-28"). This lets us build our DailySummary array cleanly.
function groupByDay(hours: HourlyForecast[]): Map<string, HourlyForecast[]> {
  const map = new Map<string, HourlyForecast[]>();

  for (const hour of hours) {
    // Extract the date portion from the ISO datetime string
    const date = hour.datetime.split("T")[0];

    if (!map.has(date)) {
      map.set(date, []);
    }
    map.get(date)!.push(hour);
  }

  return map;
}

// Transforms merged hourly data into an array of DailySummary objects.
// Applies go/no-go categorization logic to each day's demo window hours.
function buildDailySummaries(hours: HourlyForecast[]): DailySummary[] {
  const grouped = groupByDay(hours);

  return Array.from(grouped.entries()).map(([date, hourly]) => ({
    date,
    category: categorizeDay(hourly),
    hourly,
  }));
}

// Fetches weather and marine forecast data for the Gulfport test site,
// merges and transforms the responses into DailySummary objects, and
// exposes loading, error, and last-fetched states for the UI to consume.
export function useWeatherData(): UseWeatherDataReturn {
  const [data, setData] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch both APIs in parallel to minimize load time
        const [weatherRes, marineRes] = await Promise.all([
          fetch(WEATHER_API_URL),
          fetch(MARINE_API_URL),
        ]);

        if (!weatherRes.ok || !marineRes.ok) {
          throw new Error("Failed to fetch forecast data. Please try again.");
        }

        const weatherData: WeatherApiResponse = await weatherRes.json();
        const marineData: MarineApiResponse = await marineRes.json();

        // Merge, group, and categorize the raw API responses
        const merged = mergeHourlyData(weatherData, marineData);
        const summaries = buildDailySummaries(merged);

        setData(summaries);
        setLastFetched(new Date());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error, lastFetched };
}