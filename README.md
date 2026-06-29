# Saronic Weather Dashboard

A 10-day marine and weather forecast for Gulfport, MS to inform go/no-go decisions for autonomous vessel demos.

## Overview

This tool pulls hourly weather and marine forecast data from Open-Meteo and categorizes each day into one of three buckets:

- **GO** — conditions are safe across all thresholds during demo hours
- **IFFY** — conditions are marginal and warrant closer review
- **NO-GO** — one or more conditions exceed safe operating limits

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS

## Prerequisites

- Node.js v18+
- npm v9+

## Getting Started

1. Clone the repository:
```bash
   git clone https://github.com/manderson1130/saronic-challenge.git
   cd saronic-challenge
```

2. Install dependencies:
```bash
   npm install
```

3. Start the development server:
```bash
   npm run dev
```

4. Open your browser to `http://localhost:5173`

## Thresholds

All go/no-go logic is centralized in `src/lib/thresholds.ts`. Thresholds can be adjusted there without touching any component code.

| Condition   | NO-GO  |  IFFY    | GO    |
| ---------   | -----  |  ----    | --    |
| Wind Speed  | >20kts | 15-20kts | <15kts|
| Wave Height | >4ft   |  2-4ft   | <2ft  |
| Visibility  | <0.5nm | 0.5–5nm  | >5nm  |
|Precipitation| >4mm   |  1-4mm   | <1mm  |

## Project Structure

```
src/
  components/       # UI components
  hooks/            # Data fetching and transformation
  lib/              # Threshold constants and categorization logic
  types/            # Shared TypeScript interfaces
```