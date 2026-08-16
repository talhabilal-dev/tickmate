import type { CookieOptions } from "express";
import { ENV } from "../config/env.config.js";

const isProduction = ENV.NODE_ENV === "production";

const normalizeCookieDomain = (domain: string | undefined) => {
  if (!domain) return undefined;

  const withoutProtocol = domain.trim().replace(/^https?:\/\//i, "");
  const hostOnly = withoutProtocol.split("/")[0]?.split(":")[0]?.trim();

  if (!hostOnly || hostOnly === "localhost" || hostOnly === "127.0.0.1") {
    return undefined;
  }

  return hostOnly;
};

const cookieDomain = normalizeCookieDomain(ENV.COOKIE_DOMAIN);

export const getAuthCookieOptions = (maxAge: number): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  domain: cookieDomain,
  path: "/",
  maxAge,
});

export const getClearAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  domain: cookieDomain,
  path: "/",
});
