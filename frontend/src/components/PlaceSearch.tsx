"use client";

import { useEffect, useState } from "react";
import type { PlaceSuggestion } from "../types/route";
import { searchPlaces } from "../lib/api";

interface PlaceSearchProps {
  label: string;
  value: string;
  selected?: PlaceSuggestion;
  placeholder: string;
  onChange: (value: string) => void;
  onSelect: (place: PlaceSuggestion) => void;
}

export function PlaceSearch({ label, value, selected, placeholder, onChange, onSelect }: PlaceSearchProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (selected || value.trim().length < 2) {
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(undefined);
      try {
        setSuggestions(await searchPlaces(value.trim()));
      } catch (requestError) {
        setSuggestions([]);
        setError(requestError instanceof Error ? requestError.message : "Place search failed.");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [selected, value]);

  const visibleSuggestions = selected || value.trim().length < 2 ? [] : suggestions;

  return (
    <div className="relative space-y-2">
      <label className="block text-sm font-semibold text-slate-200" htmlFor={label}>
        {label}
      </label>
      <input
        id={label}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
        autoComplete="off"
      />
      {loading && <p className="text-xs text-slate-400">Searching places...</p>}
      {error && <p className="text-xs text-amber-300">{error}</p>}
      {visibleSuggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
          {visibleSuggestions.map((suggestion) => (
            <button
              type="button"
              key={`${suggestion.placeId ?? suggestion.label}-${suggestion.position.join(",")}`}
              onClick={() => {
                onSelect(suggestion);
                setSuggestions([]);
              }}
              className="block w-full border-b border-slate-800 px-4 py-3 text-left last:border-0 hover:bg-slate-800"
            >
              <span className="block text-sm font-medium text-white">{suggestion.label}</span>
              {suggestion.address && <span className="mt-1 block text-xs text-slate-400">{suggestion.address}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
