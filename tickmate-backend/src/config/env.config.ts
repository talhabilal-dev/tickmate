import dotenv from "dotenv";

dotenv.config();

const parseEnv = (value: string | undefined): string | undefined => {
  if (!value) return value;

  const trimmed = value.trim();
  const startsWithQuote = trimmed.startsWith("\"") || trimmed.startsWith("'");
  const endsWithQuote = trimmed.endsWith("\"") || trimmed.endsWith("'");

  return startsWithQuote && endsWithQuote
    ? trimmed.slice(1, -1).trim()
    : trimmed;
};

type EnvConfig = {
  PORT: string | number;
  JWT_SECRET: string | undefined;
  DATABASE_URL: string | undefined;
  CORS_ORIGINS: string | undefined;
  INNGEST_EVENT_KEY: string | undefined;
  GEMINI_API_KEY: string | undefined;
  INNGEST_SIGNING_KEY: string | undefined;
  RESEND_API_KEY: string | undefined;
  COOKIE_DOMAIN: string | undefined;
  APP_URL: string | undefined;
  NODE_ENV: string | undefined;
  EMAIL_FROM: string | undefined;
  OPENAI_API_KEY: string | undefined;
  QDRANT_URL: string | undefined;
  QDRANT_API_KEY: string | undefined;
  SIMILAR_TICKET_MIN_SCORE: string | undefined;
};

export const ENV: EnvConfig = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: parseEnv(process.env.JWT_SECRET),
  DATABASE_URL: parseEnv(process.env.DATABASE_URL),
  CORS_ORIGINS: parseEnv(process.env.CORS_ORIGINS),
  INNGEST_EVENT_KEY: parseEnv(process.env.INNGEST_EVENT_KEY),
  GEMINI_API_KEY: parseEnv(process.env.GEMINI_API_KEY),
  INNGEST_SIGNING_KEY: parseEnv(process.env.INNGEST_SIGNING_KEY),
  RESEND_API_KEY: parseEnv(process.env.RESEND_API_KEY),
  COOKIE_DOMAIN: parseEnv(process.env.COOKIE_DOMAIN),
  APP_URL: parseEnv(process.env.APP_URL),
  NODE_ENV: parseEnv(process.env.NODE_ENV),
  EMAIL_FROM: parseEnv(process.env.EMAIL_FROM),
  OPENAI_API_KEY: parseEnv(process.env.OPENAI_API_KEY),
  QDRANT_URL: parseEnv(process.env.QDRANT_URL),
  QDRANT_API_KEY: parseEnv(process.env.QDRANT_API_KEY),
  SIMILAR_TICKET_MIN_SCORE: parseEnv(process.env.SIMILAR_TICKET_MIN_SCORE),
};

