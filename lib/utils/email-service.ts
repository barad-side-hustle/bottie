import { Resend } from "resend";
import { ReactElement } from "react";
import NewUserSignupEmail from "@/lib/emails/new-user-signup";
import UserWelcomeEmail from "@/lib/emails/user-welcome";

interface EmailResult {
  success: boolean;
  error?: string;
}

interface NewUserNotificationData {
  userEmail: string;
  userName: string;
  userId: string;
  signupTimestamp: Date;
  googleProfilePicture?: string;
}

interface UserWelcomeData {
  userEmail: string;
  userName: string;
  userId: string;
}

const getResendInstance = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Email service - RESEND_API_KEY not found in environment variables");
    return null;
  }
  return new Resend(apiKey);
};

const getFromEmail = (): string => {
  return process.env.RESEND_FROM_EMAIL || "Bottie <noreply@bottie.ai>";
};

const getAdminEmail = (): string => {
  return process.env.ADMIN_NOTIFICATION_EMAIL || "alon@bottie.ai";
};

const getAppUrl = (): string => {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export async function sendEmail(
  to: string | string[],
  subject: string,
  reactComponent: ReactElement,
  from?: string
): Promise<EmailResult> {
  try {
    const resend = getResendInstance();
    if (!resend) {
      return {
        success: false,
        error: "Email service not configured (missing RESEND_API_KEY)",
      };
    }

    const fromEmail = from || getFromEmail();

    const result = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      react: reactComponent,
    });

    if (result.error) {
      console.error("Email service - Failed to send email:", {
        error: result.error,
        to,
        subject,
      });
      return {
        success: false,
        error: result.error.message || "Failed to send email",
      };
    }

    console.log("Email service - Email sent successfully:", {
      to,
      subject,
      id: result.data?.id,
    });

    return { success: true };
  } catch (error) {
    console.error("Email service - Unexpected error sending email:", {
      error: error instanceof Error ? error.message : String(error),
      to,
      subject,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendNewUserNotification(data: NewUserNotificationData): Promise<EmailResult> {
  const { userName, userEmail, userId, signupTimestamp, googleProfilePicture } = data;

  console.log("New user notification - Preparing to send admin email", {
    userId,
    userEmail,
  });

  const adminEmail = getAdminEmail();
  const appUrl = getAppUrl();
  const dashboardUrl = `${appUrl}/dashboard`;

  const emailComponent = NewUserSignupEmail({
    userName,
    userEmail,
    userId,
    signupTimestamp,
    googleProfilePicture,
    dashboardUrl,
  });

  const result = await sendEmail(adminEmail, "New User Signup - Bottie.ai", emailComponent);

  if (result.success) {
    console.log("New user notification - Admin email sent successfully", {
      userId,
      userEmail,
      adminEmail,
    });
  } else {
    console.error("New user notification - Failed to send admin email", {
      userId,
      userEmail,
      error: result.error,
    });
  }

  return result;
}

export async function sendUserWelcomeEmail(data: UserWelcomeData): Promise<EmailResult> {
  const { userName, userEmail, userId } = data;

  console.log("New user notification - Preparing to send welcome email", {
    userId,
    userEmail,
  });

  const emailComponent = UserWelcomeEmail({
    userName,
    userEmail,
  });

  const result = await sendEmail(userEmail, "Welcome to Bottie.ai - Let's Get You Started!", emailComponent);

  if (result.success) {
    console.log("New user notification - Welcome email sent successfully", {
      userId,
      userEmail,
    });
  } else {
    console.error("New user notification - Failed to send welcome email", {
      userId,
      userEmail,
      error: result.error,
    });
  }

  return result;
}
