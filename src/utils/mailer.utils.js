import { Resend } from "resend";
import ENV from "../config/env.config";

export const sendEmail = async (to, subject, text) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `
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
          <h1>${subject}</h1>
          <p>Hello,</p>
          <p>
            We're reaching out regarding an important update. Please review the details below:
          </p>
          <p>
            [Insert specific content or actionable info here]
          </p>
          <p>
            If you have any questions or need assistance, feel free to reach out to our support team.
          </p>
          <p>
            Best regards,<br/>
            The Team
          </p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Acme <no-reply@${ENV.EMAIL_FROM}>`,
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
