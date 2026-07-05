import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import type { UserJSON } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { forget } from "@/services/cognee.service";

type ClerkUserLike = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  primaryEmailAddressId?: string | null;
  emailAddresses?: Array<{
    id?: string;
    emailAddress?: string;
    email_address?: string;
  }>;
};

type ClerkEmailLike = {
  id?: string;
  emailAddress?: string;
  email_address?: string;
};

function getPrimaryEmail(user: ClerkUserLike | UserJSON) {
  const normalizedUser = user as ClerkUserLike & Partial<UserJSON>;
  const primaryEmailId =
    normalizedUser.primaryEmailAddressId ??
    normalizedUser.primary_email_address_id;

  const emailAddresses = (normalizedUser.emailAddresses ??
    normalizedUser.email_addresses) as ClerkEmailLike[] | undefined;

  const primaryEmail = emailAddresses?.find(
    (email) => email.id === primaryEmailId
  );

  return (
    primaryEmail?.emailAddress ??
    primaryEmail?.email_address ??
    emailAddresses?.[0]?.emailAddress ??
    emailAddresses?.[0]?.email_address ??
    ""
  );
}

function getFullName(user: ClerkUserLike | UserJSON, email: string) {
  const normalizedUser = user as ClerkUserLike & Partial<UserJSON>;
  const firstName = normalizedUser.firstName ?? normalizedUser.first_name;
  const lastName = normalizedUser.lastName ?? normalizedUser.last_name;
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return fullName || normalizedUser.username || email.split("@")[0] || "Candidate";
}

export async function syncClerkUserToDatabase(user: ClerkUserLike | UserJSON) {
  const email = getPrimaryEmail(user);

  if (!email) {
    throw new Error(`Clerk user ${user.id} has no email address`);
  }

  const data = {
    clerkId: user.id,
    email,
    fullName: getFullName(user, email),
  };

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ clerkId: data.clerkId }, { email: data.email }],
    },
    select: { id: true },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data,
    });
  }

  return prisma.user.create({ data });
}

export async function syncCurrentClerkUserToDatabase() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  return syncClerkUserToDatabase(user);
}

export async function deleteClerkUserFromDatabase(clerkId: string) {
  // Resolve the internal userId BEFORE deleting the row so we can pass it
  // to Cognee.  If the user doesn't exist in the DB we skip Cognee silently.
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  const result = await prisma.user.deleteMany({
    where: { clerkId },
  });

  // ── Phase 7: forget() after DB deletion ──────────────────────────────────
  // Only attempt Cognee deletion when a DB row was actually found and removed.
  // Errors must NOT prevent the DB deletion from being reported as successful.
  if (user) {
    try {
      console.log("[Cognee] Deleting Cognee memory for deleted user", {
        userId: user.id,
        clerkId,
      });
      await forget(user.id);
      console.log("[Cognee] Cognee memory deleted for user", {
        userId: user.id,
      });
    } catch (reason) {
      // Log but do not re-throw — DB deletion already succeeded.
      console.error("[Cognee] forget() failed during account deletion", {
        userId: user.id,
        clerkId,
        reason: reason instanceof Error ? reason.message : String(reason),
      });
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  return result;
}
