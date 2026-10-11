export class ProviderError extends Error {
    statusCode;
    code;
    constructor(message, statusCode = 502, code = "PROVIDER_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = "ProviderError";
    }
}
export function getErrorMessage(error) {
    return error instanceof Error ? error.message : "Unexpected error.";
}
//# sourceMappingURL=errors.js.map