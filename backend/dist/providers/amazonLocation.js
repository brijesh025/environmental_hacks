import { GeoPlacesClient, SearchTextCommand, } from "@aws-sdk/client-geo-places";
import { CalculateRoutesCommand, GeoRoutesClient, } from "@aws-sdk/client-geo-routes";
import { assertAwsRegion } from "../config.js";
import { ProviderError } from "../errors.js";
let placesClient;
let routesClient;
function getPlacesClient() {
    const region = assertAwsRegion();
    placesClient ??= new GeoPlacesClient({ region });
    return placesClient;
}
function getRoutesClient() {
    const region = assertAwsRegion();
    routesClient ??= new GeoRoutesClient({ region });
    return routesClient;
}
function asPosition(value) {
    if (!Array.isArray(value) || value.length !== 2 || !value.every((part) => typeof part === "number")) {
        return undefined;
    }
    return [value[0], value[1]];
}
function providerFailure(error, operation) {
    const message = error instanceof Error ? error.message : "Unknown Amazon Location error.";
    return new ProviderError(`Amazon Location ${operation} failed: ${message}`);
}
function formatPlace(item) {
    const position = asPosition(item.Position);
    if (!position || !item.Title)
        return undefined;
    return {
        placeId: item.PlaceId,
        label: item.Title,
        address: item.Address?.Label,
        position,
    };
}
export async function searchPlaces(query) {
    try {
        const response = await getPlacesClient().send(new SearchTextCommand({
            QueryText: query,
            MaxResults: 6,
        }));
        return (response.ResultItems ?? []).map(formatPlace).filter((place) => Boolean(place));
    }
    catch (error) {
        throw providerFailure(error, "place search");
    }
}
function extractStep(step) {
    const value = step;
    return {
        instruction: value.Instruction,
        type: value.Type,
        distanceMeters: value.Distance ?? 0,
        durationSeconds: value.Duration ?? 0,
    };
}
function normalizeRoute(route, index) {
    const value = route;
    const legs = value.Legs ?? [];
    const coordinates = legs.flatMap((leg) => leg.Geometry?.LineString ?? []).map((coordinate) => [coordinate[0], coordinate[1]]);
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
export async function calculateRoutes(input) {
    const region = assertAwsRegion();
    try {
        const request = {
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
        const response = (await getRoutesClient().send(new CalculateRoutesCommand(request)));
        const routes = (response.Routes ?? []).map(normalizeRoute);
        return {
            provider: { name: "Amazon Location Routes", region },
            routes,
            limitations: [
                "Routes, travel times, and instructions are estimates returned by Amazon Location.",
                "The provider may return fewer alternatives than requested.",
            ],
        };
    }
    catch (error) {
        if (error instanceof ProviderError)
            throw error;
        throw providerFailure(error, "route calculation");
    }
}
//# sourceMappingURL=amazonLocation.js.map