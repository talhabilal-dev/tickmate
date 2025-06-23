import dotenv from "dotenv";

dotenv.config();

const ENV = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  APP_URL: process.env.APP_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
  EMAIL_FROM: process.env.EMAIL_FROM,
};

export default ENV;
