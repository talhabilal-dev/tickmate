import { Resend } from "resend";
import { ENV } from "../config/env.config.js";

const RESEND_API_KEY = ENV.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const appName = "TickMate";

const resolveSender = (): string => {
  const fromDomain = ENV.EMAIL_FROM;
  if (fromDomain) {
    return `${appName} <no-reply@${fromDomain}>`;
  }
  return `${appName} <notifications@tickmate.app>`;
};

const defaultHtml = (subject: string, text: string): string => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f6f8fa;
            margin: 0;
            padding: 0;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.05);
            padding: 40px;
          }
          .brand {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 24px;
          }
          h1 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #333;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #555;
          }
          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="brand">${appName}</div>
          <h1>${subject}</h1>
          <p>Hello,</p>
          <p>${text}</p>
          <p>
            If you have any questions or need assistance, feel free to reach out to our support team.
          </p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  customHtml?: string
) => {
  if (!resend) {
    console.warn(
      "[mailer] RESEND_API_KEY is not configured — skipping email delivery."
    );
    return null;
  }

  const html = customHtml ?? defaultHtml(subject, text);

  try {
    const { data, error } = await resend.emails.send({
      from: resolveSender(),
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};