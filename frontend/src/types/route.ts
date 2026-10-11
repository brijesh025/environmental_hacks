export type Position = [longitude: number, latitude: number];

export type TravelMode = "Car" | "Pedestrian";
export type RoutePreference = "FastestRoute" | "ShortestRoute";

export interface LocationInput {
  label?: string;
  position: Position;
}

export interface PlaceSuggestion {
  placeId?: string;
  label: string;
  position: Position;
  address?: string;
}

export interface RouteStep {
  instruction?: string;
  type?: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteResult {
  id: string;
  geometry: {
    type: "LineString";
    coordinates: Position[];
  };
  distanceMeters: number;
  durationSeconds: number;
  steps: RouteStep[];
  notices: string[];
}

export interface RoutesResponse {
  provider: { name: string; region?: string };
  routes: RouteResult[];
  limitations: string[];
}
