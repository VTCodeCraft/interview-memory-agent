"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { RotateCw } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { SavedResume } from "@/app/onboarding/_components/options";
import {
  AccountCard,
  DeleteAccountCard,
  DetailsForm,
  MemoryCard,
  PreferencesForm,
  ResumeCard,
  SettingsSection,
  UsageCard,
  WeeklyGoalCard,
  type Usage,
} from "./_components/SettingsSections";
import {
  detailsFrom,
  preferencesFrom,
  type DetailsValues,
  type PreferenceValues,
  type ServerProfile,
} from "./_components/settings-data";

interface LoadedProfile {
  userId: string;
  fullName: string;
  email: string;
  details: DetailsValues;
  preferences: PreferenceValues;
  resume: SavedResume | null;
}

type LoadState = { status: "loading" } | { status: "error" } | { status: "ready"; data: LoadedProfile };

async function loadProfile(): Promise<LoadedProfile> {
  const response = await fetch("/api/user/profile", { cache: "no-store" });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || !body.data?.user) throw new Error(`profile ${response.status}`);
  const { user, profile, latestResume } = body.data as {
    user: { id: string; email: string; fullName: string | null };
    profile: Partial<ServerProfile> | null;
    latestResume: { originalFileName: string; pageCount: number; uploadedAt: string } | null;
  };
  return {
    userId: user.id,
    fullName: user.fullName ?? "",
    email: user.email ?? "",
    details: detailsFrom(profile),
    preferences: preferencesFrom(profile),
    resume: latestResume
      ? { fileName: latestResume.originalFileName, pages: latestResume.pageCount, uploadedAt: latestResume.uploadedAt }
      : null,
  };
}

async function loadUsage(): Promise<Usage> {
  const response = await fetch("/api/user/usage", { cache: "no-store" });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || typeof body.data?.maxUses !== "number") throw new Error(`usage ${response.status}`);
  return body.data as Usage;
}

const noop = () => () => {};

/**
 * /profile: account, profile details, resume and interview preferences (saved
 * to the account via /api/user/profile and /api/user/resume), the weekly goal
 * (this browser only, read by /analytics), the interview allowance
 * (/api/user/usage), memory reset (/api/cognee/forget) and account deletion
 * (/api/user/delete-account).
 */
export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const weeklyGoal = useSettingsStore((state) => state.weeklyGoal);
  const setWeeklyGoal = useSettingsStore((state) => state.setWeeklyGoal);
  const setStoredTargetRole = useSettingsStore((state) => state.setTargetRole);
  // The weekly goal comes from browser storage, so it's only shown once the page runs in the browser.
  const inBrowser = useSyncExternalStore(noop, () => true, () => false);

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [usage, setUsage] = useState<Usage | null | "error">(null);

  useEffect(() => {
    let cancelled = false;
    loadProfile().then(
      (data) => {
        if (cancelled) return;
        setState({ status: "ready", data });
        // Interview setup reads the role from this browser too; keep it in step with the account.
        if (data.preferences.targetRole) setStoredTargetRole(data.preferences.targetRole);
      },
      (error) => {
        console.error("[Profile] load failed", error);
        if (!cancelled) setState({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt, setStoredTargetRole]);

  useEffect(() => {
    let cancelled = false;
    loadUsage().then(
      (data) => !cancelled && setUsage(data),
      (error) => {
        console.error("[Profile] usage failed", error);
        if (!cancelled) setUsage("error");
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = state.status === "ready" ? state.data : null;
  const update = (change: Partial<LoadedProfile>) =>
    setState((current) => (current.status === "ready" ? { status: "ready", data: { ...current.data, ...change } } : current));

  const name = user?.fullName || user?.firstName || ready?.fullName || "Your account";
  const email = user?.primaryEmailAddress?.emailAddress || ready?.email || "";

  async function resetMemory() {
    if (!ready) return false;
    try {
      const response = await fetch("/api/cognee/forget", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: ready.userId }),
      });
      const body = await response.json().catch(() => null);
      return response.ok && body?.ok === true;
    } catch {
      return false;
    }
  }

  async function deleteAccount() {
    try {
      // Deletes the account everywhere (database, memory, sign-in), then clears the local session.
      const response = await fetch("/api/user/delete-account", { method: "DELETE" });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.success) return false;
      await signOut({ redirectUrl: "/" });
      return true;
    } catch {
      return false;
    }
  }

  return (
    <div className="ds-page flex-1">
      <main className="ds-container pt-8 pb-16 sm:pt-10 lg:pt-12 lg:pb-24">
        <header className="max-w-[46rem]">
          <p className="text-small font-medium text-fg-muted">Settings</p>
          <h1 className="ds-display mt-2 text-title text-balance text-fg">Profile &amp; settings</h1>
          <p className="mt-2 text-body text-fg-muted">
            Your profile, resume and interview preferences are saved to your account and used when you set up an interview.
          </p>
        </header>

        <div className="mt-10 flex flex-col gap-8">
          <SettingsSection id="settings-account" title="Account" description="Your name, email and photo are managed in your account settings.">
            {isLoaded || ready ? (
              <AccountCard
                name={name}
                email={email}
                imageUrl={user?.imageUrl}
                onManage={isLoaded ? () => openUserProfile() : undefined}
              />
            ) : (
              <div className="ds-surface flex items-center gap-4 rounded-card px-5 py-5 sm:px-6">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3.5 w-48" />
                </div>
              </div>
            )}
          </SettingsSection>

          {state.status === "error" && (
            <SettingsSection id="settings-profile" title="Profile">
              <Alert
                tone="danger"
                title="Your profile didn't load"
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setState({ status: "loading" });
                      setAttempt((count) => count + 1);
                    }}
                  >
                    <RotateCw aria-hidden strokeWidth={1.75} />
                    Try again
                  </Button>
                }
              >
                Your details, resume and interview preferences can&apos;t be shown or changed until it loads. Check your
                connection and try again.
              </Alert>
            </SettingsSection>
          )}

          {state.status === "loading" && (
            <div aria-busy="true" aria-label="Loading your profile" className="flex flex-col gap-8">
              {[
                ["Profile details", "h-48"],
                ["Resume", "h-40"],
                ["Interview preferences", "h-96"],
              ].map(([title, height]) => (
                <div key={title} className="grid gap-4 border-t border-line-subtle pt-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-10">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3.5 w-52" />
                  </div>
                  <Skeleton className={`${height} w-full rounded-card`} />
                </div>
              ))}
            </div>
          )}

          {ready && (
            <>
              <SettingsSection id="settings-details" title="Profile details" description="Saved to your account. Your experience is shown on your dashboard.">
                <DetailsForm initial={ready.details} onSaved={(details) => update({ details })} />
              </SettingsSection>

              <SettingsSection id="settings-resume" title="Resume" description="Saved to your account.">
                <ResumeCard saved={ready.resume} onUploaded={(resume) => update({ resume })} />
              </SettingsSection>

              <SettingsSection
                id="settings-preferences"
                title="Interview preferences"
                description="Saved to your account. Interview setup starts from your role, level, first company and first type."
              >
                <PreferencesForm
                  initial={ready.preferences}
                  onSaved={(preferences) => {
                    update({ preferences });
                    setStoredTargetRole(preferences.targetRole);
                  }}
                />
              </SettingsSection>
            </>
          )}

          <SettingsSection id="settings-goal" title="Weekly goal" description="Your own target for how often you practice.">
            {inBrowser ? (
              <WeeklyGoalCard goal={weeklyGoal} onChange={setWeeklyGoal} />
            ) : (
              <Skeleton className="h-36 w-full rounded-card" />
            )}
          </SettingsSection>

          <SettingsSection id="settings-usage" title="Interview allowance" description="How many interviews you can set up.">
            <UsageCard usage={usage} />
          </SettingsSection>

          <SettingsSection id="settings-memory" title="Interview memory" description="Built from your finished reports.">
            <MemoryCard canReset={Boolean(ready)} onReset={resetMemory} />
          </SettingsSection>

          <SettingsSection id="settings-delete" title="Delete account">
            <DeleteAccountCard onDelete={deleteAccount} />
          </SettingsSection>
        </div>
      </main>
    </div>
  );
}
