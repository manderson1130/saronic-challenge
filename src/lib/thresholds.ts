import type { DemoCategory, HourlyForecast } from "@/types";

// Threshold constraints will consist of a hard_limit and soft_limit
// hard_limit will determine if a metric falls into the no-go category (x >= hard_limit)
// soft_limit will determine if a metric is iffy (soft_limit <= x < hard_limit)

// knots
export const WIND_SPEED = {
    HARD_LIMIT: 20,      // above is no-go
    SOFT_LIMIT: 15,      // above is iffy
} as const;

// meters
export const WAVE_HEIGHT = {
    HARD_LIMIT: 1.2192,      // above is no-go
    SOFT_LIMIT: 0.6096,      // above is iffy
} as const;

// meters
// Source: NOAA/NWS international marine visibility standards
// Very Poor < 0.5nm, Poor 0.5-2nm, Moderate 2-5nm, Good > 5nm
// Converted to meters: 1 nautical mile = 1852 meters
export const VISIBILITY = {
    HARD_LIMIT: 926,    // below is no-go
    SOFT_LIMIT: 9260,   // below is iffy
} as const;

// mm
export const PRECIPITATION = {
    HARD_LIMIT: 4,      // above is no-go
    SOFT_LIMIT: 1,      // above is iffy
} as const;


// Assumption: Demo Window is set from 8AM-5PM
// Justification: Visibility of vessels is important to the demo, which can be difficult during the night
export const DEMO_WINDOW = {
    START_HOUR: 8,
    END_HOUR: 17
} as const;

// Hour Eval
export type HourStatus = "go" | "iffy" | "no-go";

// Function to evaluate the weather and marine conditions of a single hour
// returns one of the defined HourStatus based on the value of being out of expected bounds defined above
export function evaluateHour(hour: HourlyForecast): HourStatus {
    // Check hard limits first
    if (hour.wind_speed !== null && hour.wind_speed > WIND_SPEED.HARD_LIMIT) {
        return "no-go";
    }
    if (hour.wave_height !== null && hour.wave_height > WAVE_HEIGHT.HARD_LIMIT) {
        return "no-go";
    }
    if (hour.visibility !== null && hour.visibility < VISIBILITY.HARD_LIMIT) {
        return "no-go";
    }
    if (hour.precipitation !== null && hour.precipitation > PRECIPITATION.HARD_LIMIT) {
        return "no-go";
    }
    // Check soft limits
    if (hour.wind_speed !== null && hour.wind_speed > WIND_SPEED.SOFT_LIMIT) {
        return "iffy";
    }
    if (hour.wave_height !== null && hour.wave_height > WAVE_HEIGHT.SOFT_LIMIT) {
        return "iffy";
    }
    if (hour.visibility !== null && hour.visibility < VISIBILITY.SOFT_LIMIT) {
        return "iffy";
    }
    if (hour.precipitation !== null && hour.precipitation > PRECIPITATION.SOFT_LIMIT) {
        return "iffy";
    }
    // Anything remaining passes as go
    return "go";
}

// Categorizes a full day based on hourly conditions within the demo window.
// Logic:
//   1. Filter hours to the 8am-5pm demo window
//   2. If any hour is no-go -> day is no-go (hard cutoff)
//   3. If multiple hours are iffy -> day is iffy
//   4. Otherwise -> day is go
export function categorizeDay(hours: HourlyForecast[]): DemoCategory {
    // Filter to demo window hours only (8am-5pm)
    const demoHours = hours.filter((hour) => {
        const hourOfDay = new Date(hour.datetime).getHours();
        return hourOfDay >= DEMO_WINDOW.START_HOUR && hourOfDay < DEMO_WINDOW.END_HOUR;
    });

    // Evaluate each hour in the demo window
    const statuses = demoHours.map(evaluateHour);

    // Any no-go hour makes the whole day a no-go
    if (statuses.some((s) => s === "no-go")) {
        return "no-go";
    }

    // Multiple iffy hours makes the day iffy
    const iffyCount = statuses.filter((s) => s === "iffy").length;
    if (iffyCount > 1) {
        return "iffy";
    }

    return "go";
}