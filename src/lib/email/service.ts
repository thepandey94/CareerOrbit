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

export async function sendOtpEmail({ to, code, type }: SendOtpEmailParams): Promise<EmailDeliveryResult> {
  const subject = EMAIL_SUBJECTS[type] || "CareerOrbit Verification Code";

  // If a live Resend API key is configured, send through Resend
  if (env.RESEND_API_KEY && env.RESEND_API_KEY.trim().length > 0) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to,
          subject,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #2563eb; margin-top: 0;">CareerOrbit</h2>
              <p style="font-size: 16px; color: #1e293b;">Hello,</p>
              <p style="font-size: 16px; color: #1e293b;">Use the 6-digit verification code below to complete your action:</p>
              <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 6px; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${code}</span>
              </div>
              <p style="font-size: 14px; color: #64748b;">This code will expire in <strong>10 minutes</strong>. If you did not request this, please disregard this email.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">CareerOrbit — Your journey. Your skills. Your career.</p>
            </div>
          `,
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

  // Development / Test Fallback: Safe Terminal Logging
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
