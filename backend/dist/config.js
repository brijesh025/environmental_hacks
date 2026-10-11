import "dotenv/config";
function requiredOrUndefined(value) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}
export const config = {
    port: Number(process.env.PORT ?? 4000),
    awsRegion: requiredOrUndefined(process.env.AWS_REGION),
    frontendOrigin: requiredOrUndefined(process.env.FRONTEND_ORIGIN) ?? "http://localhost:3000",
};
export function assertAwsRegion() {
    if (!config.awsRegion) {
        throw new Error("AWS_REGION is not configured. Add it to backend/.env before using Amazon Location.");
    }
    return config.awsRegion;
}
//# sourceMappingURL=config.js.map