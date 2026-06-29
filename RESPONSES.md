## 1. Decisions, Priorities, and Trade-offs
The main goal of this tool is to help Tara, or anyone else involved,
schedule product demos by providing insight on the water and weather
conditions at the Gulfport test site. The tool is not meant to be
deterministic — it surfaces the right information in one place so Tara
can make a confident call, rather than replacing her judgment.

When planning this out, my main priorities were the functional
requirements of the tool:

- Fetch hourly weather and marine forecast data from Open-Meteo for a
  10-day window
- Merge both API responses into a unified hourly data structure
- Evaluate conditions only during the assumed demo window (8am–5pm),
  since demos are customer-facing events that require daylight and
  follow standard business hours
- Categorize each day into one of three buckets, GO, IFFY, or NO-GO,
  based on Tara's stated thresholds
- Present a glanceable 10-day summary so Tara can assess the week in
  under 10 seconds
- Allow her to drill into any day for an hourly breakdown that explains
  what is driving the category. The data layer supports this and it
  is scoped for the next iteration.

A key design decision was how to handle the go/no-go logic. I landed on
a hybrid approach where any single hour in the demo window breaching a hard
threshold (wind > 20 kts, waves > 4 ft, visibility < 0.5 nm,
precipitation > 4 mm/hr) makes the entire day a NO-GO. If no hard
limits are breached but multiple hours hit soft thresholds, the day is
IFFY. Otherwise it is GO. This is an important assumption where users/decision-makers
likely think about it as some conditions are absolute safety limits while
others are judgment calls.

Visibility thresholds were sourced from NOAA/NWS international marine
visibility standards rather than assumed arbitrarily. Precipitation was
treated as a hard no-go above 4 mm/hr because heavy rain directly
impacts optics and vessel visibility independent of what the visibility
sensor reads, which is the core purpose of the demo.

**What I left out:**

- Multiple location support: Gulfport is hardcoded for v1. The hook
  is structured so that location can be passed as a parameter in a
  future version without a rewrite.
- Additional go/no-go criteria beyond the four validated thresholds.
  Extra API fields like swell period and weather code are available, but
  I did not apply these because I had not validated with Tara how they are evaluated. 
  Applying a bad threshold is worse than surfacing no threshold at all. This is where
  including the raw data in the drilldown would benefit the user in case they
  need to review other conditions to make the call.
- Day drilldown modal: the hourly data is fetched, merged, and stored
  per day in the data model. The component was descoped due to time
  constraints but is the next priority to build.

**What I would ask Tara before building the next version:**

- How long are demos, and can partial days be considered? This would
  let me refine the demo window and partial-day viability logic.
  Although it was listed as something to consider, which led to me
  committing to specific logic, it is an important question to align on.
- How far out are demos typically committed? If demos are booked 2 weeks
  out, the tool should visually communicate that days 7-10 are directional
  forecasts, not reliable predictions.
- Are there additional conditions beyond the four listed that matter for
  go/no-go decisions?
- How do you currently communicate your decision to stakeholders? If she
  is forwarding a screenshot or sharing a link, that shapes how the
  output should look.

## 2. How I Would Evolve This Tool

When evaluating future enhancements I like to weigh three factors:
**effort** (how difficult and time-consuming the implementation is),
**impact** (how much it improves the overall user experience), and
**reach** (how many users benefit from the change). With that framework
in mind, here is how I would prioritize the roadmap:

**1. Multiple Locations — Build Next**

Adding Panama City, Norfolk, and San Diego is the highest priority. The
impact is significant because it expands the tool from a single-site
to a company-wide scheduling resource. The reach grows immediately since
demo coordinators across all four sites would benefit. Most importantly,
the effort is low. The current architecture was built with this in mind where 
the API URLs and coordinates are isolated in the data hook, so adding
location support is largely a matter of parameterizing what is already
there rather than restructuring anything.

**2. Historical Weather Patterns**

This feature has strong impact and expands the reach of the tool beyond
operations into planning and leadership conversations, which gives PM's data
to push back on demos being scheduled during historically poor weather
windows. However, it ranks second because the effort is meaningfully
higher. Historical data requires a different data source, likely some
form of data storage or aggregation layer, and more analysis work to
present patterns meaningfully. It is worth scoping carefully before
committing to it.

**3. Mobile Version**

A mobile version for boat captains is a natural evolution but ranks
third. The current tool is designed for Tara's desktop morning routine
and the component structure would need to be revisited for smaller
screens. The reach is also more limited in this iteration since the
description scopes it specifically to captains on the water. That said,
the value is clear — anyone involved in a demo would benefit from a
quick glance on their phone.