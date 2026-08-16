import jwt from "jsonwebtoken";
import { ENV } from "../config/env.config.js";

export type MagicLinkPurpose =
    | "email_verification"
    | "password_reset"
    | "password_change";

type GenerateMagicLinkInput = {
    userId: string;
    email: string;
    purpose: MagicLinkPurpose;
    baseUrl?: string;
    expiresInMinutes?: number;
};

type GenerateMagicLinkResult = {
    rawToken: string;
    link: string;
    expiresAt: Date;
};

const getMagicLinkPath = (purpose: MagicLinkPurpose): string => {
    if (purpose === "email_verification") {
        return "/auth/verify-email";
    }

    if (purpose === "password_reset") {
        return "/auth/reset-password";
    }

    if (purpose === "password_change") {
        return "/auth/reset-password";
    }

    return "/auth/verify-email";
};

export const generateMagicLink = async ({
    userId,
    email,
    purpose,
    baseUrl = ENV.APP_URL,
    expiresInMinutes = 30,
}: GenerateMagicLinkInput): Promise<GenerateMagicLinkResult> => {
    if (!baseUrl) {
        throw new Error("APP_URL is not set. Pass baseUrl or set APP_URL in env.");
    }

    if (!userId) {
        throw new Error("userId is required to generate a magic link.");
    }

    if (!email) {
        throw new Error("email is required to generate a magic link.");
    }

    if (!ENV.JWT_SECRET) {
        throw new Error("JWT_SECRET is not set. Cannot sign magic link token.");
    }

    if (expiresInMinutes <= 0) {
        throw new Error("expiresInMinutes must be greater than 0.");
    }

    const rawToken = jwt.sign(
        { userId, email, purpose },
        ENV.JWT_SECRET,
        { expiresIn: expiresInMinutes * 60 }
    );
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const linkUrl = new URL(getMagicLinkPath(purpose), baseUrl);
    linkUrl.searchParams.set("token", rawToken);

    return {
        rawToken,
        link: linkUrl.toString(),
        expiresAt,
    };
};
