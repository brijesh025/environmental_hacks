"use client";

import { useEffect, useRef } from "react";
import { LngLatBounds, Map as MapLibre, Marker, NavigationControl, type GeoJSONSource, type Map as MapLibreMap, type MapMouseEvent } from "maplibre-gl";
import type { PlaceSuggestion, Position, RouteResult } from "../types/route";

interface RouteMapProps {
  origin?: PlaceSuggestion;
  destination?: PlaceSuggestion;
  routes: RouteResult[];
  selectedRouteId?: string;
  selectionTarget?: "origin" | "destination";
  onMapPositionSelected: (position: Position) => void;
}

const sourceId = "routewell-routes";

export function RouteMap({ origin, destination, routes, selectedRouteId, selectionTarget, onMapPositionSelected }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | undefined>(undefined);
  const originMarkerRef = useRef<Marker | undefined>(undefined);
  const destinationMarkerRef = useRef<Marker | undefined>(undefined);
  const selectionTargetRef = useRef(selectionTarget);
  const mapPositionSelectedRef = useRef(onMapPositionSelected);
  const apiKey = process.env.NEXT_PUBLIC_AMAZON_LOCATION_API_KEY;
  const region = process.env.NEXT_PUBLIC_AMAZON_LOCATION_REGION;
  const style = process.env.NEXT_PUBLIC_AMAZON_LOCATION_MAP_STYLE ?? "Standard";

  useEffect(() => {
    selectionTargetRef.current = selectionTarget;
    mapPositionSelectedRef.current = onMapPositionSelected;
  }, [onMapPositionSelected, selectionTarget]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !apiKey || !region) return;

    const map = new MapLibre({
      container: containerRef.current,
      center: [78.9629, 20.5937],
      zoom: 4,
      style: `https://maps.geo.${region}.amazonaws.com/v2/styles/${style}/descriptor?key=${apiKey}`,
    });
    map.addControl(new NavigationControl(), "top-right");
    map.on("click", (event: MapMouseEvent) => {
      if (selectionTargetRef.current) mapPositionSelectedRef.current([event.lngLat.lng, event.lngLat.lat]);
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = undefined;
    };
  }, [apiKey, region, style]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateRoutes = () => {
      const featureCollection = {
        type: "FeatureCollection" as const,
        features: routes.map((route) => ({
          type: "Feature" as const,
          properties: { routeId: route.id, selected: route.id === selectedRouteId },
          geometry: route.geometry,
        })),
      };

      const source = map.getSource(sourceId) as GeoJSONSource | undefined;
      if (source) {
        source.setData(featureCollection);
      } else {
        map.addSource(sourceId, { type: "geojson", data: featureCollection });
        map.addLayer({
          id: "routewell-routes-outline",
          type: "line",
          source: sourceId,
          paint: { "line-color": "#082f49", "line-width": 9, "line-opacity": 0.9 },
        });
        map.addLayer({
          id: "routewell-routes-line",
          type: "line",
          source: sourceId,
          paint: {
            "line-color": ["case", ["get", "selected"], "#22d3ee", "#94a3b8"],
            "line-width": ["case", ["get", "selected"], 6, 4],
            "line-opacity": ["case", ["get", "selected"], 1, 0.75],
          },
        });
      }

      if (routes.length > 0) {
        const bounds = new LngLatBounds();
        routes.forEach((route) => route.geometry.coordinates.forEach((coordinate) => bounds.extend(coordinate)));
        map.fitBounds(bounds, { padding: 70, maxZoom: 15, duration: 700 });
      }
    };

    if (map.isStyleLoaded()) updateRoutes();
    else map.once("load", updateRoutes);
  }, [routes, selectedRouteId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    originMarkerRef.current?.remove();
    destinationMarkerRef.current?.remove();

    if (origin) originMarkerRef.current = new Marker({ color: "#22d3ee" }).setLngLat(origin.position).addTo(map);
    if (destination) destinationMarkerRef.current = new Marker({ color: "#fb7185" }).setLngLat(destination.position).addTo(map);
  }, [origin, destination]);

  if (!apiKey || !region) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center text-sm text-slate-400">
        Add the Amazon Location region and restricted browser API key to `frontend/.env` to load the map.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div ref={containerRef} className="min-h-[420px] w-full" />
      {selectionTarget && <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-slate-950/90 px-4 py-2 text-xs font-semibold text-cyan-200">Click the map to set the {selectionTarget}</div>}
    </div>
  );
}
