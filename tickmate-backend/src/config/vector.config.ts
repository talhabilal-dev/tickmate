import { QdrantClient } from "@qdrant/js-client-rest";
import { ENV } from "./env.config.js";

if (!ENV.QDRANT_URL) {
    throw new Error("QDRANT_URL is not configured in environment variables");
}

if (!ENV.QDRANT_API_KEY && ENV.NODE_ENV === 'production') {
    throw new Error("QDRANT_API_KEY is required in production");
}

if (!ENV.QDRANT_API_KEY) {
    console.warn("QDRANT_API_KEY is not set - using local Qdrant without authentication");
}

export const client = new QdrantClient({
    url: ENV.QDRANT_URL,
    ...(ENV.QDRANT_API_KEY && { apiKey: ENV.QDRANT_API_KEY }),
});
