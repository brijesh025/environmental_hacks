import { z } from "zod";
const positionSchema = z
    .array(z.number().finite())
    .length(2)
    .refine(([longitude, latitude]) => longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90, {
    message: "Position must be [longitude, latitude] within WGS84 bounds.",
})
    .transform(([longitude, latitude]) => [longitude, latitude]);
const locationSchema = z.object({
    label: z.string().trim().max(300).optional(),
    position: positionSchema,
});
export const routeRequestSchema = z
    .object({
    origin: locationSchema,
    destination: locationSchema,
    travelMode: z.enum(["Car", "Pedestrian"]),
    routePreference: z.enum(["FastestRoute", "ShortestRoute"]),
    departureTime: z.string().datetime({ offset: true }).optional(),
})
    .superRefine((value, context) => {
    if (value.origin.position[0] === value.destination.position[0] && value.origin.position[1] === value.destination.position[1]) {
        context.addIssue({
            code: "custom",
            path: ["destination", "position"],
            message: "Origin and destination must be different.",
        });
    }
});
export function parseRouteRequest(input) {
    return routeRequestSchema.parse(input);
}
export function parsePlaceQuery(input) {
    const result = z.string().trim().min(2).max(200).safeParse(input);
    if (!result.success) {
        throw new Error("Place search query must be between 2 and 200 characters.");
    }
    return result.data;
}
//# sourceMappingURL=schemas.js.map