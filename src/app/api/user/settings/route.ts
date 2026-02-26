import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema/auth.schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [row] = await db
      .select({ emailOnNewReview: user.emailOnNewReview })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return NextResponse.json({
      emailOnNewReview: row?.emailOnNewReview ?? true,
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

    if (body.emailOnNewReview !== undefined) {
      if (typeof body.emailOnNewReview !== "boolean") {
        return NextResponse.json({ error: "Invalid emailOnNewReview value" }, { status: 400 });
      }

      await db
        .update(user)
        .set({ emailOnNewReview: body.emailOnNewReview, updatedAt: new Date() })
        .where(eq(user.id, session.user.id));
    }

    const [row] = await db
      .select({ emailOnNewReview: user.emailOnNewReview })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return NextResponse.json({
      emailOnNewReview: row?.emailOnNewReview ?? true,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
