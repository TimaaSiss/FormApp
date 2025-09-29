"use server";

import nodemailer from "nodemailer";

interface EmailMessage {
  from?: string;
  html: string;
  replyTo?: string;
  to?: string;
  subject: string;
  attachments?: {
    filename: string;
    path: string;
  }[];
}

const emailTitle = process.env.NEXT_PUBLIC_APP_NAME || "Cirtic";
const emailSupport = process.env.SMTP_FROM_EMAIL || "";
const emailNoReplyto = "noreplyto@cirtic.com";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;

let transporter: nodemailer.Transporter | null = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
    connectionTimeout: 10000,
  });
} else {
  console.warn("SMTP transporter not configured. Emails will not be sent.");
}

export const sendMail = async (
  message: EmailMessage,
  support: boolean = false,
  cc: string[] = []
) => {
  try {
    if (process.env.NODE_ENV == "development") return { success: true };

    if (!transporter) {
      console.warn("Cannot send email, transporter is not configured.");
      console.log("Email content:", message);
      return { success: false, info: "Transporter not configured", message };
    }

    const mailOptions = support
      ? {
          ...message,
          to: `${emailTitle} <${emailSupport}>`,
          from: `${emailTitle} <${emailNoReplyto}>`,
          replyTo: `${emailTitle} <${emailNoReplyto}>`,
          cc,
        }
      : {
          ...message,
          from: `${emailTitle} <${emailSupport || emailNoReplyto}>`,
          replyTo: `${emailTitle} <${emailSupport || emailNoReplyto}>`,
        };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (error: any) {
    console.error("Failed to send email:", error.message || error);
    return { success: false, error: error.message || error, message };
  }
};
