import { QdrantClient } from "@qdrant/js-client-rest";
import { ENV } from "./env.config.js";

const QDRANT_URL = ENV.QDRANT_URL;

if (!QDRANT_URL) {
  console.warn(
    "[qdrant] QDRANT_URL is not configured — AI similar-ticket search will be unavailable."
  );
}

if (!ENV.QDRANT_API_KEY && ENV.NODE_ENV === "production") {
  console.warn(
    "[qdrant] QDRANT_API_KEY is not set in production — connection may fail."
  );
}

export const client = QDRANT_URL
  ? new QdrantClient({
      url: QDRANT_URL,
      ...(ENV.QDRANT_API_KEY && { apiKey: ENV.QDRANT_API_KEY }),
    })
  : null;

export const vectorDbConfigured = Boolean(QDRANT_URL);