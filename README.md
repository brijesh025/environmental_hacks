# RouteWell - Build Roadmap

> **Product:** A health-aware route planner that compares practical routes using travel time, air quality, heat, UV and rain, then recommends a route and gives condition-aware travel guidance.
>
> **Build order:** Build a complete working local prototype first. Integrate the required AWS services while building the prototype. Only after the prototype works end to end will we work on deployment, hosting, CI/CD, monitoring, budgets, and production infrastructure.
>
> **Current target:** Version 1 - normal route mapping.

## 1. Product goal

A user enters an origin, destination, travel mode and departure time. RouteWell first shows useful route alternatives. Later versions add environmental assessment for each route, a transparent recommendation algorithm, and suggestions for safe and comfortable stops along the selected route.

The product must be honest about data quality. Weather and pollution forecasts are estimates, not measurements at every street. Never fabricate route geometry, AQI, forecasts, APIs, or route results. If a source is unavailable or too coarse to distinguish two nearby routes, say so in the UI.

## 2. Build order

We will work in this order:

1. Build the complete Version 1 application locally.
2. Connect real Amazon Location services during local development where the feature needs them.
3. Run the frontend and backend together as a usable local prototype.
4. Improve the local prototype until the full Version 1 user flow works.
5. Only then add AWS deployment resources, hosted frontend infrastructure, CI/CD, monitoring, budgets, and production configuration.
6. After Version 1 is complete, move to Version 2.

Deployment is not part of the first build phase. The local backend will use the same TypeScript business logic that will later run in Lambda, but it will initially be started as a normal local Node.js server.

## 3. Planned versions

### Version 1 - Route mapping

**Goal:** A reliable mapping application that finds and displays route alternatives based on a user's journey plan.

**User inputs**

- Origin and destination through place/address search.
- Map selection as a fallback when search is unavailable.
- Travel mode: car and walking initially.
- Route preference: fastest or shortest, where supported.
- Optional departure time.

**Features**

- Interactive map with origin, destination and route lines.
- A small set of useful alternatives, not every possible route.
- Route cards showing duration, distance, and route instructions when returned by the service.
- Clicking a route card highlights that route on the map.
- Loading, validation, no-route, API error, retry, and responsive states.
- Routing provider and relevant limitations shown in the UI.

Version 1 does not include environmental scores, health claims, weather, pollution, route recommendations, or stops.

### Version 2 - Per-route environmental assessment

**Goal:** Compare the environmental conditions a user is likely to encounter on each route. This version informs the user but does not automatically select the best route.

**Data sources**

- Open-Meteo Forecast API for hourly temperature, apparent temperature, humidity, precipitation, UV and wind.
- Open-Meteo Air Quality API for pollutant concentrations and a clearly named provider AQI index where available.
- Data providers must stay behind backend interfaces so another verified source can be added later.

**Assessment pipeline**

1. Take route geometry and duration from Version 1.
2. Sample representative points along each route.
3. Estimate arrival time at each point.
4. Fetch and cache relevant forecast values.
5. Calculate route summaries and segment data.

Open-Meteo air-quality forecasts are coarse. We must disclose spatial resolution and avoid claiming street-level pollution precision or a meaningful route advantage when both routes map to the same forecast area.

### Version 3 - Best-route recommendation

**Goal:** Recommend a route using a transparent and deterministic algorithm.

Preferences may include:

- Balanced.
- Minimize pollution exposure.
- Avoid heat and UV.
- Avoid rain where forecasts support it.
- Fastest or time-priority.

The algorithm will use named configuration, explain trade-offs in plain language, respect detour constraints, and report when the environmental data is too similar or too coarse to identify a clear winner.

### Version 4 - On-route guidance and useful stops

**Goal:** Explain how to travel the selected route more comfortably and suggest useful real places along the route.

Potential features include route-step guidance, Amazon Location Places search near route segments, detour-aware stop ranking, and deterministic condition-aware advice. Places and place attributes must come from a source; generated place names and unsupported claims are not allowed.

## 4. Technology direction

### Frontend

- Next.js with TypeScript and the App Router.
- Tailwind CSS.
- MapLibre GL JS for the interactive map.
- Amazon Location map tiles.
- Browser-only map code in Client Components with dynamic loading where required.

### Backend

- TypeScript rather than Python or plain JavaScript.
- Node.js 24 for the later Lambda runtime.
- AWS SDK for JavaScript v3.
- A local Node.js HTTP server during prototype development.
- A Lambda handler adapter later, using the same backend services and provider code.
- Zod or an equivalent runtime schema library for request validation.

The backend remains one TypeScript codebase. Local development and later Lambda deployment use the same route, provider, validation, and service logic; only the HTTP/runtime adapter changes.

### AWS integration during prototype development

- Amazon Location Places for place search.
- Amazon Location Routes for route calculations and alternatives.
- Amazon Location Maps for map tiles.
- Local AWS credentials/profile for backend calls.
- A restricted Amazon Location browser key in the local frontend environment for map tiles.

The browser must not receive AWS secret access keys. The local backend uses the developer's AWS profile or environment credentials. Later Lambda uses an IAM execution role.

### Deployment phase, after the prototype

These are intentionally postponed until the local prototype is complete:

- AWS Lambda deployment.
- API Gateway HTTP API.
- Amplify Hosting.
- SAM/CloudFormation deployment resources.
- CloudWatch production logging and alarms.
- IAM production roles.
- AWS Budgets.
- Git-based CI/CD.

## 5. Local prototype architecture

```text
User browser
    |
    v
Next.js frontend on localhost
    |
    | local HTTP JSON calls
    v
TypeScript backend on localhost
    |
    +--> Amazon Location Places
    +--> Amazon Location Routes
    +--> Amazon Location Maps from the browser
```

Later, the same backend services will be placed behind API Gateway and Lambda:

```text
Browser -> Amplify frontend -> API Gateway -> Lambda TypeScript backend -> Amazon Location
```

## 6. Local repository layout

```text
routewell/
|-- README.md
|-- version_plan.md
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   |-- lib/
|   |   |-- types/
|   |-- public/
|   |-- package.json
|-- backend/
|   |-- src/
|   |   |-- server/
|   |   |-- handlers/
|   |   |-- providers/
|   |   |-- services/
|   |   |-- schemas/
|   |   |-- types/
|   |-- tests/
|   |-- package.json
|-- docs/
|   |-- data-sources.md
|   |-- local-development.md
|-- .env.example
|-- .gitignore
```

The deployment directory and SAM template will be added later, after the local prototype is working.

## 7. Version 1 local API outline

### `GET /api/health`

Returns a basic local backend status.

### `GET /api/places?q=...`

Place suggestions through the backend provider layer. The frontend does not call Amazon Location Places directly.

### `POST /api/routes`

Calculates route alternatives through the backend provider layer.

Example request:

```json
{
  "origin": {
    "label": "Origin",
    "position": [77.5946, 12.9716]
  },
  "destination": {
    "label": "Destination",
    "position": [77.6412, 12.925]
  },
  "travelMode": "Car",
  "routePreference": "FastestRoute",
  "departureTime": "2026-10-10T09:00:00+05:30"
}
```

Route geometry will be normalized internally as GeoJSON `LineString` coordinates in `[longitude, latitude]` order. Provider-specific response structures stay inside the Amazon Location adapter.

## 8. Version 1 build instructions

1. Create the Next.js frontend and TypeScript backend packages.
2. Add local environment configuration without committing secrets.
3. Build the trip form and place-search controls.
4. Build the local backend routes and request schemas.
5. Connect the backend to Amazon Location Places and Routes using the AWS SDK v3.
6. Build the MapLibre map and render real route geometry.
7. Add route cards, route selection, instructions, and provider notices.
8. Add loading, empty, error, and retry behavior.
9. Run the complete application locally from the browser using real route data.
10. Polish the Version 1 local experience.
11. After the prototype is complete, plan the AWS deployment phase separately.

For the current local setup, see [`docs/local-development.md`](docs/local-development.md).

## 9. Security and data rules

- Do not commit credentials, tokens, API keys, or `.env` files.
- Do not put AWS secret access keys in frontend code.
- Do not store trip history or exact origin/destination by default.
- Set network timeouts and handle upstream errors.
- Do not hide provider failures behind fake data.
- Display relevant provider limitations.
- Never call an environmental estimate a medical risk assessment or guaranteed health improvement.
- Do not use LLM-generated numeric forecasts, place names, AQI values, or route results.

## Useful references

- [Amazon Location CalculateRoutes](https://docs.aws.amazon.com/location/latest/APIReference/API_CalculateRoutes.html)
- [Amazon Location alternate routes](https://docs.aws.amazon.com/location/latest/developerguide/calculate-routes-alternate.html)
- [Amazon Location Maps](https://docs.aws.amazon.com/location/latest/developerguide/maps.html)
- [Amazon Location authentication](https://docs.aws.amazon.com/location/latest/developerguide/access.html)
- [AWS Lambda Node.js runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
- [AWS Lambda with TypeScript](https://docs.aws.amazon.com/lambda/latest/dg/lambda-typescript.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [Open-Meteo Weather API](https://open-meteo.com/en/docs)
- [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)
