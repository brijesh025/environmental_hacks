import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { getErrorMessage, ProviderError } from "./errors.js";
import { parsePlaceQuery, parseRouteRequest } from "./schemas.js";
import { calculateRoutes, searchPlaces } from "./providers/amazonLocation.js";
export const app = express();
app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json({ limit: "64kb" }));
app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", service: "routewell-backend" });
});
app.get("/api/places", async (request, response, next) => {
    try {
        const query = parsePlaceQuery(request.query.q);
        response.json({ suggestions: await searchPlaces(query) });
    }
    catch (error) {
        next(error);
    }
});
app.post("/api/routes", async (request, response, next) => {
    try {
        const input = parseRouteRequest(request.body);
        response.json(await calculateRoutes(input));
    }
    catch (error) {
        next(error);
    }
});
const errorHandler = (error, _request, response, _next) => {
    if (error instanceof ProviderError) {
        response.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
        return;
    }
    response.status(400).json({ error: { code: "REQUEST_ERROR", message: getErrorMessage(error) } });
};
app.use(errorHandler);
//# sourceMappingURL=app.js.map