import type { LocationInput, PlaceSuggestion, RoutePreference, RoutesResponse, TravelMode } from "../types/route";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${backendUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  const payload = (await response.json().catch(() => undefined)) as { error?: { message?: string } } | T | undefined;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload ? payload.error?.message : undefined;
    throw new Error(message ?? `Request failed with status ${response.status}.`);
  }
  return payload as T;
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const result = await request<{ suggestions: PlaceSuggestion[] }>(`/api/places?q=${encodeURIComponent(query)}`);
  return result.suggestions;
}

export async function requestRoutes(input: {
  origin: LocationInput;
  destination: LocationInput;
  travelMode: TravelMode;
  routePreference: RoutePreference;
  departureTime?: string;
}): Promise<RoutesResponse> {
  return request<RoutesResponse>("/api/routes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
