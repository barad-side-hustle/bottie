import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UsersController } from "@/lib/controllers/users.controller";
import type { UserConfigUpdate } from "@/lib/types/user.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const controller = new UsersController();
    const config = await controller.getUserConfig(user.id);

    return NextResponse.json({
      emailOnNewReview: config.configs.EMAIL_ON_NEW_REVIEW,
      weeklySummaryEnabled: config.configs.WEEKLY_SUMMARY_ENABLED ?? false,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates: UserConfigUpdate = {};

    if (body.emailOnNewReview !== undefined) {
      if (typeof body.emailOnNewReview !== "boolean") {
        return NextResponse.json({ error: "Invalid emailOnNewReview value" }, { status: 400 });
      }
      updates.EMAIL_ON_NEW_REVIEW = body.emailOnNewReview;
    }

    if (body.weeklySummaryEnabled !== undefined) {
      if (typeof body.weeklySummaryEnabled !== "boolean") {
        return NextResponse.json({ error: "Invalid weeklySummaryEnabled value" }, { status: 400 });
      }
      updates.WEEKLY_SUMMARY_ENABLED = body.weeklySummaryEnabled;
    }

    const controller = new UsersController();
    const updatedConfig = await controller.updateUserConfig(user.id, updates);

    return NextResponse.json({
      emailOnNewReview: updatedConfig.configs.EMAIL_ON_NEW_REVIEW,
      weeklySummaryEnabled: updatedConfig.configs.WEEKLY_SUMMARY_ENABLED ?? false,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
