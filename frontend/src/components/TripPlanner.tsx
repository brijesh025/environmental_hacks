"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { PlaceSearch } from "./PlaceSearch";
import { RouteCard } from "./RouteCard";
import { requestRoutes } from "../lib/api";
import type { PlaceSuggestion, Position, RoutePreference, RoutesResponse, TravelMode } from "../types/route";

const RouteMap = dynamic(() => import("./RouteMap").then((module) => module.RouteMap), { ssr: false });

export function TripPlanner() {
  const [origin, setOrigin] = useState<PlaceSuggestion>();
  const [destination, setDestination] = useState<PlaceSuggestion>();
  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");
  const [travelMode, setTravelMode] = useState<TravelMode>("Car");
  const [routePreference, setRoutePreference] = useState<RoutePreference>("FastestRoute");
  const [departureTime, setDepartureTime] = useState("");
  const [selectionTarget, setSelectionTarget] = useState<"origin" | "destination">();
  const [result, setResult] = useState<RoutesResponse>();
  const [selectedRouteId, setSelectedRouteId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleMapPositionSelected = useCallback((position: Position) => {
    const selected: PlaceSuggestion = { label: `Map selection (${position[1].toFixed(5)}, ${position[0].toFixed(5)})`, position };
    if (selectionTarget === "origin") {
      setOrigin(selected);
      setOriginText(selected.label);
    } else if (selectionTarget === "destination") {
      setDestination(selected);
      setDestinationText(selected.label);
    }
    setSelectionTarget(undefined);
  }, [selectionTarget]);

  const canSubmit = Boolean(origin && destination && !loading);
  const selectedRoute = useMemo(() => result?.routes.find((route) => route.id === selectedRouteId), [result, selectedRouteId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!origin || !destination) {
      setError("Choose an origin and destination before requesting routes.");
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      const nextResult = await requestRoutes({
        origin: { label: origin.label, position: origin.position },
        destination: { label: destination.label, position: destination.position },
        travelMode,
        routePreference,
        ...(departureTime ? { departureTime: new Date(departureTime).toISOString() } : {}),
      });
      setResult(nextResult);
      setSelectedRouteId(nextResult.routes[0]?.id);
      if (nextResult.routes.length === 0) setError("The routing provider returned no routes for this journey.");
    } catch (requestError) {
      setResult(undefined);
      setSelectedRouteId(undefined);
      setError(requestError instanceof Error ? requestError.message : "Route request failed.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setOrigin(undefined);
    setDestination(undefined);
    setOriginText("");
    setDestinationText("");
    setResult(undefined);
    setSelectedRouteId(undefined);
    setError(undefined);
    setSelectionTarget(undefined);
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[390px_1fr]">
      <section className="space-y-5 rounded-3xl border border-slate-800 bg-slate-950/75 p-5 shadow-2xl shadow-slate-950/40">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Version 1</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Plan a better route.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Compare real route alternatives using travel time, distance, and provider instructions.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <PlaceSearch label="Origin" value={originText} selected={origin} placeholder="Search starting point" onChange={(value) => { setOriginText(value); setOrigin(undefined); }} onSelect={(place) => { setOrigin(place); setOriginText(place.label); }} />
          <button type="button" onClick={() => setSelectionTarget("origin")} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">Set origin on map</button>
          <PlaceSearch label="Destination" value={destinationText} selected={destination} placeholder="Search destination" onChange={(value) => { setDestinationText(value); setDestination(undefined); }} onSelect={(place) => { setDestination(place); setDestinationText(place.label); }} />
          <button type="button" onClick={() => setSelectionTarget("destination")} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">Set destination on map</button>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2 text-sm font-semibold text-slate-200">Travel mode<select value={travelMode} onChange={(event) => setTravelMode(event.target.value as TravelMode)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm font-normal text-white outline-none focus:border-cyan-400"><option value="Car">Car</option><option value="Pedestrian">Walking</option></select></label>
            <label className="space-y-2 text-sm font-semibold text-slate-200">Preference<select value={routePreference} onChange={(event) => setRoutePreference(event.target.value as RoutePreference)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm font-normal text-white outline-none focus:border-cyan-400"><option value="FastestRoute">Fastest</option><option value="ShortestRoute">Shortest</option></select></label>
          </div>

          <label className="block space-y-2 text-sm font-semibold text-slate-200">Departure time <span className="font-normal text-slate-500">optional</span><input type="datetime-local" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm font-normal text-white outline-none focus:border-cyan-400" /></label>

          <div className="flex gap-3 pt-2"><button type="submit" disabled={!canSubmit} className="flex-1 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">{loading ? "Finding routes..." : "Find routes"}</button><button type="button" onClick={reset} className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:border-slate-500">Reset</button></div>
        </form>

        {error && <div className="rounded-xl border border-amber-900/80 bg-amber-950/40 p-3 text-sm leading-5 text-amber-200">{error}</div>}
        {result && <div className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-white">Available routes</h2><span className="text-xs text-slate-500">{result.provider.name}</span></div>{result.routes.map((route, index) => <RouteCard key={route.id} route={route} index={index} selected={route.id === selectedRouteId} onSelect={() => setSelectedRouteId(route.id)} />)}{result.limitations.map((limitation) => <p key={limitation} className="text-xs leading-5 text-slate-500">{limitation}</p>)}</div>}
        {selectedRoute && selectedRoute.steps.length > 0 && <details className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><summary className="cursor-pointer text-sm font-semibold text-white">Route instructions</summary><ol className="mt-4 space-y-3 text-sm text-slate-400">{selectedRoute.steps.map((step, index) => <li key={`${step.type}-${index}`}><span className="mr-2 text-cyan-300">{index + 1}.</span>{step.instruction ?? step.type ?? "Continue"}</li>)}</ol></details>}
      </section>

      <section className="min-h-[500px]"><RouteMap origin={origin} destination={destination} routes={result?.routes ?? []} selectedRouteId={selectedRouteId} selectionTarget={selectionTarget} onMapPositionSelected={handleMapPositionSelected} /></section>
    </main>
  );
}
