# RouteWell Version Plan

Last updated: 2026-10-10

This is the living plan. We will update the checkboxes and add notes as we build.

- `[ ] USER` is something needed from the user.
- `[ ] CODEX` is something Codex will build or document.
- `[x]` means it is already done.

## Main rule

Build a complete working local prototype first.

AWS services will be integrated during local development whenever the product needs them. Deployment, hosting, CI/CD, production IAM, CloudWatch, budgets, and production infrastructure come only after the local prototype is working end to end.

There will be one TypeScript backend codebase. During the prototype it runs as a local Node.js server. Later the same backend services will run behind API Gateway and Lambda.

## Technology plan

- [x] CODEX: Use TypeScript for both frontend and backend.
- [x] CODEX: Use Next.js App Router for the frontend.
- [x] CODEX: Use MapLibre GL JS for the map.
- [x] CODEX: Use Amazon Location for Places, Routes, and Maps where required.
- [x] CODEX: Use Node.js 24 as the later Lambda runtime.
- [x] CODEX: Use AWS SDK for JavaScript v3.
- [x] CODEX: Use a local Node.js backend during the prototype phase.
- [x] CODEX: Keep the backend provider and service logic reusable for later Lambda deployment.
- [x] CODEX: Choose and pin the exact frontend and backend package versions during scaffolding.

## Things needed from the user

- [ ] USER: Provide or make available an AWS account when Amazon Location integration is started.
- [ ] USER: Provide the AWS region to use for Amazon Location during local development.
- [ ] USER: Make sure a local AWS profile or other safe AWS credential method is available for backend calls.
- [ ] USER: Provide a restricted Amazon Location browser API key for local map tiles when map work starts.
- [ ] USER: Give a first city or geography for trying the application.
- [ ] USER: Tell Codex about any preferred visual style, colors, or branding.

Deployment access, Amplify access, CI/CD credentials, production domains, and production IAM roles are not needed yet.

## Version 1 - Complete local prototype

### Phase 1: Project setup

- [x] CODEX: Read the README and identify Version 1 as the first build.
- [x] CODEX: Confirm the repository started with only the README.
- [x] CODEX: Create this living version plan.
- [x] CODEX: Create the Next.js frontend package.
- [x] CODEX: Create the TypeScript backend package.
- [x] CODEX: Add root `.gitignore`.
- [x] CODEX: Add `.env.example` files with placeholders only.
- [x] CODEX: Add local Windows/PowerShell start commands.
- [x] CODEX: Make the frontend and backend start locally together.

### Phase 2: Backend foundation

- [x] CODEX: Create the local HTTP server.
- [x] CODEX: Create shared request and response types.
- [x] CODEX: Add runtime request validation.
- [x] CODEX: Add `GET /api/health`.
- [x] CODEX: Add `GET /api/places?q=...`.
- [x] CODEX: Add `POST /api/routes`.
- [x] CODEX: Add readable JSON errors.
- [x] CODEX: Add request limits and provider error handling.
- [x] CODEX: Keep provider-specific response structures inside provider adapters.

### Phase 3: Real Amazon Location integration

- [ ] USER: Provide the AWS region and local AWS credential method.
- [ ] USER: Provide the restricted browser map API key.
- [x] CODEX: Connect the backend to Amazon Location Places with AWS SDK v3.
- [x] CODEX: Connect the backend to Amazon Location Routes with AWS SDK v3.
- [x] CODEX: Support car and walking routes.
- [x] CODEX: Support fastest and shortest preferences where available.
- [x] CODEX: Support an optional departure time where supported.
- [x] CODEX: Request a small bounded number of alternatives.
- [x] CODEX: Normalize real provider geometry into GeoJSON LineStrings.
- [x] CODEX: Normalize route duration, distance, steps, and provider notices.
- [x] CODEX: Return provider failures to the frontend instead of inventing route data.

### Phase 4: Frontend trip experience

- [x] CODEX: Build origin place search.
- [x] CODEX: Build destination place search.
- [x] CODEX: Add debouncing and bounded place-search requests.
- [x] CODEX: Add map-click selection for origin and destination.
- [x] CODEX: Add car and walking controls.
- [x] CODEX: Add fastest and shortest controls.
- [x] CODEX: Add optional departure-time input.
- [x] CODEX: Add submit, reset, retry, and loading behavior.
- [x] CODEX: Add accessible form labels and messages.

### Phase 5: Map and routes UI

- [x] CODEX: Add the MapLibre map as a client-only component.
- [x] CODEX: Render Amazon Location map tiles when local map configuration exists.
- [x] CODEX: Render origin and destination markers.
- [x] CODEX: Render every route returned by the backend.
- [x] CODEX: Fit the map to the route set.
- [x] CODEX: Highlight the selected route.
- [x] CODEX: Add route cards with distance and duration.
- [x] CODEX: Show route instructions when returned.
- [x] CODEX: Show provider and limitation information.
- [x] CODEX: Add responsive desktop and mobile layout.

### Phase 6: Finish the local Version 1 prototype

- [x] CODEX: Connect the complete form-to-backend-to-map flow.
- [ ] CODEX: Make the normal journey flow work with real Amazon Location data after user configuration is supplied.
- [x] CODEX: Handle loading, empty, no-route, network, quota, and provider-error states.
- [x] CODEX: Remove fake route data and unfinished demo behavior.
- [x] CODEX: Document how to start the complete local prototype.
- [ ] USER: Run the local prototype using the chosen target geography.
- [ ] USER: Report any product or UI changes wanted before deployment work begins.

## After Version 1: deployment phase

Do not start these tasks until the local Version 1 prototype is complete.

- [ ] USER: Approve starting deployment work.
- [ ] CODEX: Add the Lambda runtime adapter around the existing backend services.
- [ ] CODEX: Add API Gateway HTTP API.
- [ ] CODEX: Add SAM/CloudFormation infrastructure.
- [ ] CODEX: Add Lambda IAM execution permissions.
- [ ] CODEX: Add CloudWatch production logging.
- [ ] CODEX: Add Amplify Hosting configuration.
- [ ] CODEX: Add production environment variables and domain restrictions.
- [ ] CODEX: Add AWS Budget alerts.
- [ ] CODEX: Add Git-based CI/CD only after the deployment path is working manually.

## Later product versions

### Version 2 - Environmental assessment

- [ ] USER: Approve starting Version 2 after the local Version 1 product is complete.
- [ ] CODEX: Add weather provider integration.
- [ ] CODEX: Add air-quality provider integration.
- [ ] CODEX: Add route sampling and forecast-time matching.
- [ ] CODEX: Add environmental comparison without automatically selecting a route.

### Version 3 - Route recommendation

- [ ] USER: Approve starting Version 3.
- [ ] CODEX: Add transparent deterministic route scoring.
- [ ] CODEX: Add preferences, detour limits, ties, and plain-language explanations.

### Version 4 - Guidance and useful stops

- [ ] USER: Approve starting Version 4.
- [ ] CODEX: Add source-backed places near route segments.
- [ ] CODEX: Add deterministic condition-aware guidance.

## Change log

### 2026-10-10

- Created the living version plan.
- Changed the backend from Python to TypeScript.
- Reordered the project around a complete local prototype first.
- Moved deployment, hosting, CI/CD, monitoring, budgets, and production infrastructure to a later phase.
- Removed the old deployment-first milestone gates from the working plan.
