import { env } from "../env";

export interface SendOtpEmailParams {
  to: string;
  code: string;
  type: "REGISTRATION" | "PASSWORD_RESET" | "EMAIL_CHANGE";
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const EMAIL_SUBJECTS = {
  REGISTRATION: "Your CareerOrbit Verification Code",
  PASSWORD_RESET: "CareerOrbit Password Reset Code",
  EMAIL_CHANGE: "Verify Your New CareerOrbit Email",
};

/**
 * Parses sender string like "CareerOrbit <verified@domain.com>" or "verified@domain.com"
 * into a structured object required by transactional email APIs like Brevo.
 */
function parseSender(from: string): { name: string; email: string } {
  const match = from.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim() || "CareerOrbit",
      email: match[2].trim(),
    };
  }
  return {
    name: "CareerOrbit",
    email: from.trim(),
  };
}

function getEmailHtml(code: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; margin-top: 0; font-size: 24px; font-weight: 700;">CareerOrbit</h2>
      <p style="font-size: 16px; color: #1e293b; line-height: 1.5;">Hello,</p>
      <p style="font-size: 16px; color: #1e293b; line-height: 1.5;">Use the 6-digit verification code below to complete your action:</p>
      <div style="background-color: #f1f5f9; padding: 18px; text-align: center; border-radius: 8px; margin: 24px 0;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: monospace;">${code}</span>
      </div>
      <p style="font-size: 14px; color: #64748b; line-height: 1.5;">This code will expire in <strong>10 minutes</strong>. If you did not request this, please disregard this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">CareerOrbit — Your journey. Your skills. Your career.</p>
    </div>
  `;
}

export async function sendOtpEmail({ to, code, type }: SendOtpEmailParams): Promise<EmailDeliveryResult> {
  const subject = EMAIL_SUBJECTS[type] || "CareerOrbit Verification Code";
  const htmlContent = getEmailHtml(code);

  // 1. Primary Provider: Brevo Transactional REST API
  // Supports BREVO_API_KEY or Brevo keys (xkeysib-) configured under RESEND_API_KEY
  const brevoApiKey =
    env.BREVO_API_KEY && env.BREVO_API_KEY.trim().length > 0
      ? env.BREVO_API_KEY.trim()
      : env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith("xkeysib-")
      ? env.RESEND_API_KEY.trim()
      : undefined;

  if (brevoApiKey) {
    try {
      const sender = parseSender(env.EMAIL_FROM);
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          sender,
          to: [{ email: to }],
          subject,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[EmailService] Brevo API error response:", errorText);
        return { success: false, error: `Failed to deliver email via Brevo: ${response.statusText}` };
      }

      const data = (await response.json()) as { messageId?: string };
      return { success: true, messageId: data.messageId || `brevo-${Date.now()}` };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[EmailService] Brevo API network exception:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // 2. Secondary Provider: Resend REST API (Backward-compatible fallback, only if NOT a Brevo key)
  if (
    env.RESEND_API_KEY &&
    env.RESEND_API_KEY.trim().length > 0 &&
    !env.RESEND_API_KEY.startsWith("xkeysib-")
  ) {

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to,
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[EmailService] Resend API error:", errorText);
        return { success: false, error: `Failed to deliver email: ${response.statusText}` };
      }

      const data = (await response.json()) as { id: string };
      return { success: true, messageId: data.id };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[EmailService] Exception during email delivery:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // 3. In Production: Reject delivery if no provider is configured
  if (env.NODE_ENV === "production") {
    console.error("[EmailService] Neither BREVO_API_KEY nor RESEND_API_KEY is configured in production.");
    return {
      success: false,
      error: "Email delivery service is currently unavailable.",
    };
  }

  // 4. Development & Test Mode Fallback: Safe Terminal Logging (never in production)
  console.log("--------------------------------------------------");
  console.log(`[EmailService: DEV MODE] Target: ${to}`);
  console.log(`[EmailService: DEV MODE] Type: ${type}`);
  console.log(`[EmailService: DEV MODE] Verification Code: >>> ${code} <<<`);
  console.log(`[EmailService: DEV MODE] Expiring in 10 minutes.`);
  console.log("--------------------------------------------------");

  return {
    success: true,
    messageId: `dev-mock-${Date.now()}`,
  };
}

