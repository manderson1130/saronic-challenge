import type { DailySummary } from "@/types";
import { StatusBadge } from "./StatusBadge";

interface Props {
    summary: DailySummary;
    onClick: (summary: DailySummary) => void;
}

// Formats a date string like "2026-06-28" into "Sat Jun 28"
function formatDate(dateStr: string): { weekday: string; date: string } {
  const date = new Date(dateStr + "T12:00:00"); // noon to avoid timezone shifts
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

// Pulls the worst-case value for a condition across the demo window hours (8am-5pm) so Tara can see what's driving the category at a glance
function getWorstCase(
    summary: DailySummary,
    field: "wind_speed" | "wave_height" | "precipitation" | "visibility"
): number | null {
    const demoHours = summary.hourly.filter((h) => {
        const hour = new Date(h.datetime).getHours();
        return hour >=8 && hour < 17;
    });

    const values = demoHours
        .map((h) => h[field])
        .filter((v): v is number => v !== null);

    if (values.length === 0) return null;

    // Visibility is worst when lowest, everything else is worst when highest
    return field === "visibility"
        ? Math.min(...values)
        : Math.max(...values);
}

export function DayCard({ summary, onClick }: Props) {
  const { weekday, date } = formatDate(summary.date);
  const worstWind = getWorstCase(summary, "wind_speed");
  const worstWave = getWorstCase(summary, "wave_height");
  const worstPrecip = getWorstCase(summary, "precipitation");
  const worstVis = getWorstCase(summary, "visibility");

  // Card border color gives an immediate visual cue before reading anything
  const borderColors = {
    "go": "border-green-300",
    "iffy": "border-yellow-300",
    "no-go": "border-red-300",
  };

  return (
    <div
      onClick={() => onClick(summary)}
      className={`border-2 ${borderColors[summary.category]} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow bg-white flex flex-col gap-2 min-w-[130px]`}
    >
      {/* Date header */}
      <div className="text-center">
        <p className="text-xs text-gray-500 font-medium uppercase">{weekday}</p>
        <p className="text-sm font-semibold text-gray-800">{date}</p>
      </div>

      {/* Go/no-go badge */}
      <div className="flex justify-center">
        <StatusBadge category={summary.category} />
      </div>

      {/* Key conditions at a glance */}
      <div className="text-xs text-gray-600 flex flex-col gap-1 mt-1">
        <div className="flex justify-between gap-2">
          <span>💨 Wind</span>
          <span className="font-medium">
            {worstWind !== null ? `${worstWind.toFixed(0)} kts` : "N/A"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span>🌊 Waves</span>
          <span className="font-medium">
            {worstWave !== null ? `${(worstWave * 3.28084).toFixed(1)} ft` : "N/A"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span>🌧️ Rain</span>
          <span className="font-medium">
            {worstPrecip !== null ? `${worstPrecip.toFixed(1)} mm` : "N/A"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span>👁️ Vis</span>
          <span className="font-medium">
            {worstVis !== null ? `${(worstVis / 1852).toFixed(1)} nm` : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}