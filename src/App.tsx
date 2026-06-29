import { useWeatherData } from "./hooks/useWeatherData";
import { DayCard } from "./components/DayCard";
import type { DailySummary } from "./types";
import { useState } from "react";

function App() {
  const { data, loading, error, lastFetched } = useWeatherData();
  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null);

  if(loading){
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading forecast...</p>
      </div>
    );
  }

  if(error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gulfport Demo Weather Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gulf Test Range — Gulfport, MS · 10-Day Forecast
        </p>
        {lastFetched && (
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {lastFetched.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* 10-day strip */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {data.map((summary) => (
          <DayCard
            key={summary.date}
            summary={summary}
            onClick={setSelectedDay}
          />
        ))}
      </div>

      {/* Placeholder for modal — we'll replace this next */}
      {selectedDay && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">
            Selected: {selectedDay.date} — modal coming soon
          </p>
          <button
            onClick={() => setSelectedDay(null)}
            className="text-xs text-gray-400 mt-2 underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default App