// DemoCategory represents the 3 categoires that demo days will be bucketed in
export type DemoCategory = "go" | "iffy" | "no-go"

// HourlyForecast is the hourly data for weather and marine data
export interface HourlyForecast {
    // the specific date and time by the hour
    datetime: string;
    // wind speed in knots
    wind_speed: number | null;
    // wave height in meters
    wave_height: number | null;
    // precipitation in mm
    precipitation: number | null;
    // visibility in meters
    visibility: number | null;
}

// represents a day's summarized forecast
export interface DailySummary {
    // the specifc day
    date: string;
    // determines if a day should be scheduled for a demo
    category: DemoCategory;
    // all 24 hours of forecast data that can be used for drilldown
    hourly: HourlyForecast[];
}