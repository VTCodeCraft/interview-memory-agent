import { NextRequest } from "next/server";

import { requireUserId, AuthError } from "@/services/auth.service";
import { getFullProfile, updateProfile } from "@/services/user.service";
import { profileUpdateSchema } from "@/lib/validations/profile";
import { success, failure, unauthorized, handleZodError } from "@/lib/utils/api";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const clerkId = await requireUserId();
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return failure("User not found", 404);
    }

    const profile = await getFullProfile(user.id);

    if (!profile) {
      return failure("User not found", 404);
    }

    return success({
      user: {
        id: profile.id,
        clerkId: profile.clerkId,
        email: profile.email,
        fullName: profile.fullName,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
      profile: profile.profile,
      latestResume: profile.resumes[0] ?? null,
      latestJobDescription: profile.jobDescriptions[0] ?? null,
      analytics: profile.analytics,
    });
  } catch (reason) {
    if (reason instanceof AuthError) {
      return unauthorized();
    }
    const message = reason instanceof Error ? reason.message : "Failed to load profile";
    return failure(message, 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const clerkId = await requireUserId();

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return failure("User not found", 404);
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return handleZodError(parsed.error);
    }

    if (Object.keys(parsed.data).length === 0) {
      return failure("No fields to update", 400);
    }

    const profile = await updateProfile(user.id, parsed.data);

    return success({ profile });
  } catch (reason) {
    if (reason instanceof AuthError) {
      return unauthorized();
    }
    const message = reason instanceof Error ? reason.message : "Failed to update profile";
    return failure(message, 500);
  }
}
