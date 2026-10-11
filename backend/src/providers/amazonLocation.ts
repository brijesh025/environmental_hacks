import {
  GeoPlacesClient,
  SearchTextCommand,
  type SearchTextCommandOutput,
} from "@aws-sdk/client-geo-places";
import {
  CalculateRoutesCommand,
  GeoRoutesClient,
  type CalculateRoutesCommandOutput,
} from "@aws-sdk/client-geo-routes";
import { assertAwsRegion } from "../config.js";
import { ProviderError } from "../errors.js";
import type { PlaceSuggestion, RouteRequest, RouteResult, RoutesResponse, Position } from "../types.js";

let placesClient: GeoPlacesClient | undefined;
let routesClient: GeoRoutesClient | undefined;

function getPlacesClient(): GeoPlacesClient {
  const region = assertAwsRegion();
  placesClient ??= new GeoPlacesClient({ region });
  return placesClient;
}

function getRoutesClient(): GeoRoutesClient {
  const region = assertAwsRegion();
  routesClient ??= new GeoRoutesClient({ region });
  return routesClient;
}

function asPosition(value: unknown): Position | undefined {
  if (!Array.isArray(value) || value.length !== 2 || !value.every((part) => typeof part === "number")) {
    return undefined;
  }
  return [value[0], value[1]];
}

function providerFailure(error: unknown, operation: string): ProviderError {
  const message = error instanceof Error ? error.message : "Unknown Amazon Location error.";
  return new ProviderError(`Amazon Location ${operation} failed: ${message}`);
}

function formatPlace(item: NonNullable<SearchTextCommandOutput["ResultItems"]>[number]): PlaceSuggestion | undefined {
  const position = asPosition(item.Position);
  if (!position || !item.Title) return undefined;

  return {
    placeId: item.PlaceId,
    label: item.Title,
    address: item.Address?.Label,
    position,
  };
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  try {
    const response = await getPlacesClient().send(
      new SearchTextCommand({
        QueryText: query,
        MaxResults: 6,
      }),
    );

    return (response.ResultItems ?? []).map(formatPlace).filter((place): place is PlaceSuggestion => Boolean(place));
  } catch (error) {
    throw providerFailure(error, "place search");
  }
}

function extractStep(step: unknown): RouteResult["steps"][number] {
  const value = step as { Instruction?: string; Type?: string; Distance?: number; Duration?: number };
  return {
    instruction: value.Instruction,
    type: value.Type,
    distanceMeters: value.Distance ?? 0,
    durationSeconds: value.Duration ?? 0,
  };
}

function normalizeRoute(route: unknown, index: number): RouteResult {
  const value = route as {
    Legs?: Array<{
      Geometry?: { LineString?: number[][] };
      Summary?: { Overview?: { Distance?: number; Duration?: number } };
      TravelSteps?: unknown[];
      Notices?: Array<{ Code?: string; Impact?: string }>;
    }>;
  };

  const legs = value.Legs ?? [];
  const coordinates = legs.flatMap((leg) => leg.Geometry?.LineString ?? []).map((coordinate) => [coordinate[0], coordinate[1]] as Position);
  const distanceMeters = legs.reduce((sum, leg) => sum + (leg.Summary?.Overview?.Distance ?? 0), 0);
  const durationSeconds = legs.reduce((sum, leg) => sum + (leg.Summary?.Overview?.Duration ?? 0), 0);
  const steps = legs.flatMap((leg) => (leg.TravelSteps ?? []).map(extractStep));
  const notices = legs.flatMap((leg) => (leg.Notices ?? []).map((notice) => [notice.Code, notice.Impact].filter(Boolean).join(": "))).filter(Boolean);

  if (coordinates.length < 2) {
    throw new ProviderError(`Amazon Location returned route ${index + 1} without usable geometry.`);
  }

  return {
    id: `route-${index + 1}`,
    geometry: { type: "LineString", coordinates },
    distanceMeters,
    durationSeconds,
    steps,
    notices,
  };
}

export async function calculateRoutes(input: RouteRequest): Promise<RoutesResponse> {
  const region = assertAwsRegion();

  try {
    const request: ConstructorParameters<typeof CalculateRoutesCommand>[0] = {
      Origin: input.origin.position,
      Destination: input.destination.position,
      TravelMode: input.travelMode,
      OptimizeRoutingFor: input.routePreference,
      MaxAlternatives: 2,
      LegGeometryFormat: "Simple",
      TravelStepType: "Default",
      LegAdditionalFeatures: ["Summary", "TravelStepInstructions"],
      InstructionsMeasurementSystem: "Metric",
      ...(input.departureTime ? { DepartureTime: input.departureTime } : {}),
    };

    const response = (await getRoutesClient().send(new CalculateRoutesCommand(request))) as CalculateRoutesCommandOutput;
    const routes = (response.Routes ?? []).map(normalizeRoute);

    return {
      provider: { name: "Amazon Location Routes", region },
      routes,
      limitations: [
        "Routes, travel times, and instructions are estimates returned by Amazon Location.",
        "The provider may return fewer alternatives than requested.",
      ],
    };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw providerFailure(error, "route calculation");
  }
}
