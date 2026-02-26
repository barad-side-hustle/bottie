import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UsersController } from "@/lib/controllers/users.controller";
import type { UserConfigUpdate } from "@/lib/types/user.types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const controller = new UsersController();
    const config = await controller.getUserConfig(session.user.id);

    return NextResponse.json({
      emailOnNewReview: config.configs.EMAIL_ON_NEW_REVIEW,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
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

    const controller = new UsersController();
    const updatedConfig = await controller.updateUserConfig(session.user.id, updates);

    return NextResponse.json({
      emailOnNewReview: updatedConfig.configs.EMAIL_ON_NEW_REVIEW,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
