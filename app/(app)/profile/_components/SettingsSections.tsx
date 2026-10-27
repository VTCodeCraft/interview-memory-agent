"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, CircleAlert, ExternalLink } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/feedback";
import { Field, FieldError, FieldHint, Label } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { ROUTES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { ChoiceCard } from "@/app/onboarding/_components/ChoiceCard";
import { ResumeUpload } from "@/app/onboarding/_components/ResumeUpload";
import { SegmentedRadio } from "@/app/onboarding/_components/SegmentedRadio";
import {
  COMPANY_OPTIONS,
  DIFFICULTY_OPTIONS,
  EXPERIENCE_OPTIONS,
  INTERVIEW_TYPE_OPTIONS,
  type SavedResume,
} from "@/app/onboarding/_components/options";
import {
  detailsPayload,
  errorsFor,
  firstPick,
  goalFromInput,
  preferencesPayload,
  sameValues,
  serverFieldErrors,
  toggleChoice,
  validateDetails,
  validatePreferences,
  withSaved,
  type DetailsValues,
  type Errors,
  type PreferenceValues,
} from "./settings-data";

/* ── Layout ─────────────────────────────────────────────────────────────── */

/** Title and description on the left, controls on the right; stacked on small screens. */
export function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="grid gap-4 border-t border-line-subtle pt-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-10">
      <div className="min-w-0">
        <h2 id={id} className="text-subheading text-fg">
          {title}
        </h2>
        {description && <div className="mt-1.5 text-small text-fg-muted">{description}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("ds-surface rounded-card", className)}>{children}</div>;
}

/** Save row: status on the left (announced), button on the right. */
function SaveBar({
  status,
  dirty,
  saving,
  label,
}: {
  status: SaveStatus;
  dirty: boolean;
  saving: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col-reverse border-t border-line-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6">
      {/* Stays in the DOM (live region); only takes space when it has something to say. */}
      <p aria-live="polite" className="text-small [&:not(:empty)]:mt-3 sm:min-h-5 sm:[&:not(:empty)]:mt-0">
        {status.state === "saved" && !dirty && (
          <span className="inline-flex items-center gap-1.5 text-success">
            <Check aria-hidden strokeWidth={2} className="size-3.5" />
            Saved
          </span>
        )}
        {status.state === "error" && (
          <span className="inline-flex items-center gap-1.5 font-medium text-danger">
            <CircleAlert aria-hidden strokeWidth={2} className="size-3.5" />
            {status.message}
          </span>
        )}
        {dirty && status.state !== "error" && <span className="text-fg-muted">Unsaved changes</span>}
      </p>
      <Button type="submit" variant="primary" loading={saving} disabled={!dirty || saving} className="sm:min-w-32">
        {saving ? "Saving" : label}
      </Button>
    </div>
  );
}

type SaveStatus = { state: "idle" } | { state: "saved" } | { state: "error"; message: string };

interface SaveResult {
  ok: boolean;
  /** Field messages from a 422 response. */
  fields?: Record<string, string>;
  message?: string;
}

/** PATCH /api/user/profile with only the given fields. */
async function patchProfile(payload: Record<string, unknown>): Promise<SaveResult> {
  try {
    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => null);
    if (response.ok && body?.success) return { ok: true };
    if (response.status === 422) return { ok: false, fields: serverFieldErrors(body?.errors), message: "Check the highlighted fields." };
    if (response.status === 401) return { ok: false, message: "Your session has ended. Sign in again to save." };
    return { ok: false, message: "Couldn't save. Check your connection and try again." };
  } catch {
    return { ok: false, message: "Couldn't save. Check your connection and try again." };
  }
}

/** Moves focus to the first field marked invalid, once React has rendered the errors. */
function focusFirstInvalid(form: HTMLFormElement) {
  requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}

/* ── Account (managed by the sign-in provider) ──────────────────────────── */

export function AccountCard({
  name,
  email,
  imageUrl,
  onManage,
}: {
  name: string;
  email: string;
  imageUrl?: string;
  /** Missing until the sign-in provider has loaded. */
  onManage?: () => void;
}) {
  return (
    <Card className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <span aria-hidden className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-subheading text-brand ring-1 ring-memory-line ring-inset">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            (name.trim()[0] ?? "?").toUpperCase()
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-body font-semibold text-fg">{name}</p>
          {email && <p className="truncate text-small text-fg-muted">{email}</p>}
        </div>
      </div>
      <Button variant="secondary" onClick={onManage} disabled={!onManage} className="shrink-0">
        Manage account
        <ExternalLink aria-hidden strokeWidth={1.75} />
      </Button>
    </Card>
  );
}

/* ── Profile details (saved to the account) ─────────────────────────────── */

export function DetailsForm({ initial, onSaved }: { initial: DetailsValues; onSaved: (values: DetailsValues) => void }) {
  const ids = { experience: useId(), github: useId(), linkedin: useId(), hint: useId() };
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Errors<DetailsValues>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>({ state: "idle" });
  const dirty = !sameValues(values, initial);
  const experienceOptions = withSaved(EXPERIENCE_OPTIONS, [initial.experience]);

  const update = (key: keyof DetailsValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus({ state: "idle" });
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const problems = validateDetails(values);
    setErrors(problems);
    if (Object.keys(problems).length > 0) {
      setStatus({ state: "error", message: "Check the highlighted fields." });
      focusFirstInvalid(form);
      return;
    }
    setSaving(true);
    const result = await patchProfile(detailsPayload(values));
    setSaving(false);
    if (result.ok) {
      const saved = { ...values, githubUrl: values.githubUrl.trim(), linkedinUrl: values.linkedinUrl.trim() };
      setValues(saved);
      setStatus({ state: "saved" });
      onSaved(saved);
    } else {
      const fields = errorsFor(result.fields, values);
      setErrors(fields);
      setStatus({
        state: "error",
        message: result.fields && Object.keys(fields).length === 0 ? "Some values weren't accepted. Check them and try again." : (result.message ?? "Couldn't save."),
      });
      focusFirstInvalid(form);
    }
  }

  const describe = (...items: (string | false | undefined)[]) => items.filter(Boolean).join(" ") || undefined;

  return (
    <Card>
      <form noValidate onSubmit={submit}>
        <div className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6 md:grid-cols-2">
          <Field className="md:col-span-2">
            <Label htmlFor={ids.experience}>Experience</Label>
            {/* Width on a wrapper so the select's chevron stays inside it. */}
            <div className="md:max-w-[20rem]">
              <Select id={ids.experience} value={values.experience} onChange={(event) => update("experience", event.target.value)}>
                {!values.experience && <option value="">Not set</option>}
                {experienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            {errors.experience && <FieldError>{errors.experience}</FieldError>}
          </Field>
          <Field>
            <Label htmlFor={ids.github}>GitHub</Label>
            <Input
              id={ids.github}
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://github.com/username"
              value={values.githubUrl}
              aria-invalid={Boolean(errors.githubUrl) || undefined}
              aria-describedby={describe(errors.githubUrl && `${ids.github}-error`)}
              onChange={(event) => update("githubUrl", event.target.value)}
            />
            {errors.githubUrl && <FieldError id={`${ids.github}-error`}>{errors.githubUrl}</FieldError>}
          </Field>
          <Field>
            <Label htmlFor={ids.linkedin}>LinkedIn</Label>
            <Input
              id={ids.linkedin}
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://linkedin.com/in/username"
              value={values.linkedinUrl}
              aria-invalid={Boolean(errors.linkedinUrl) || undefined}
              aria-describedby={describe(errors.linkedinUrl && `${ids.linkedin}-error`)}
              onChange={(event) => update("linkedinUrl", event.target.value)}
            />
            {errors.linkedinUrl && <FieldError id={`${ids.linkedin}-error`}>{errors.linkedinUrl}</FieldError>}
          </Field>
          <FieldHint id={ids.hint} className="md:col-span-2">
            Links are optional. Leave a field empty to remove it.
          </FieldHint>
        </div>
        <SaveBar status={status} dirty={dirty} saving={saving} label="Save details" />
      </form>
    </Card>
  );
}

/* ── Resume (saved to the account) ──────────────────────────────────────── */

export function ResumeCard({ saved, onUploaded }: { saved: SavedResume | null; onUploaded: (resume: SavedResume) => void }) {
  const hintId = useId();
  return (
    <Card className="px-5 py-5 sm:px-6 sm:py-6">
      <p id={hintId} className="mb-4 text-small text-fg-muted">
        Interviews use your most recent resume. A new upload replaces it once the file has been read.
      </p>
      <ResumeUpload saved={saved} onUploaded={onUploaded} onBusyChange={() => {}} describedById={hintId} />
    </Card>
  );
}

/* ── Interview preferences (saved to the account) ───────────────────────── */

function Legend({ children }: { children: ReactNode }) {
  return <legend className="text-small font-semibold text-fg">{children}</legend>;
}

export function PreferencesForm({ initial, onSaved }: { initial: PreferenceValues; onSaved: (values: PreferenceValues) => void }) {
  const ids = { role: useId(), level: useId(), companies: useId(), types: useId() };
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Errors<PreferenceValues>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>({ state: "idle" });
  const dirty = !sameValues(values, initial);
  const companyOptions = withSaved(COMPANY_OPTIONS, initial.targetCompanies);
  const typeOptions = [
    ...INTERVIEW_TYPE_OPTIONS,
    ...withSaved(
      INTERVIEW_TYPE_OPTIONS.map((option) => option.value),
      initial.interviewTypes,
    )
      .slice(INTERVIEW_TYPE_OPTIONS.length)
      .map((value) => ({ value, label: value.replace(/_/g, " ").replace(/^\w/, (letter) => letter.toUpperCase()), description: "" })),
  ];

  function update<K extends keyof PreferenceValues>(key: K, value: PreferenceValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus({ state: "idle" });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const problems = validatePreferences(values);
    setErrors(problems);
    if (Object.keys(problems).length > 0) {
      setStatus({ state: "error", message: "Check the highlighted fields." });
      focusFirstInvalid(form);
      return;
    }
    setSaving(true);
    const result = await patchProfile(preferencesPayload(values));
    setSaving(false);
    if (result.ok) {
      const saved = { ...values, targetRole: values.targetRole.trim() };
      setValues(saved);
      setStatus({ state: "saved" });
      onSaved(saved);
    } else {
      const fields = errorsFor(result.fields, values);
      setErrors(fields);
      setStatus({
        state: "error",
        message: result.fields && Object.keys(fields).length === 0 ? "Some values weren't accepted. Check them and try again." : (result.message ?? "Couldn't save."),
      });
      focusFirstInvalid(form);
    }
  }

  return (
    <Card>
      <form noValidate onSubmit={submit}>
        <div className="flex flex-col gap-6 px-5 py-5 sm:px-6 sm:py-6">
          <Field>
            <Label htmlFor={ids.role}>Target role</Label>
            <Input
              id={ids.role}
              value={values.targetRole}
              maxLength={120}
              autoComplete="organization-title"
              aria-invalid={Boolean(errors.targetRole) || undefined}
              aria-describedby={errors.targetRole ? `${ids.role}-error` : undefined}
              onChange={(event) => update("targetRole", event.target.value)}
              className="md:max-w-[28rem]"
            />
            {errors.targetRole && <FieldError id={`${ids.role}-error`}>{errors.targetRole}</FieldError>}
          </Field>

          <fieldset aria-describedby={ids.level} className="flex flex-col gap-3">
            <Legend>Interview level</Legend>
            <FieldHint id={ids.level}>How demanding the questions are. You can change it for any interview.</FieldHint>
            <div className="md:max-w-[28rem]">
              <SegmentedRadio
                name="preferredDifficulty"
                value={values.preferredDifficulty}
                options={DIFFICULTY_OPTIONS}
                onChange={(value) => update("preferredDifficulty", value)}
                describedBy={ids.level}
              />
            </div>
            {errors.preferredDifficulty && <FieldError>{errors.preferredDifficulty}</FieldError>}
          </fieldset>

          <fieldset aria-describedby={ids.companies} className="flex flex-col gap-3">
            <Legend>Target companies</Legend>
            <FieldHint id={ids.companies}>Your first pick is preselected when you set up an interview. Optional.</FieldHint>
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-3.5 sm:grid-cols-3">
              {companyOptions.map((company) => (
                <ChoiceCard
                  key={company}
                  name="targetCompanies"
                  value={company}
                  label={company}
                  tag={firstPick(values.targetCompanies, company)}
                  checked={values.targetCompanies.includes(company)}
                  onChange={(on) => update("targetCompanies", toggleChoice(values.targetCompanies, company, on))}
                />
              ))}
            </div>
            {errors.targetCompanies && <FieldError>{errors.targetCompanies}</FieldError>}
          </fieldset>

          <fieldset aria-describedby={ids.types} className="flex flex-col gap-3">
            <Legend>Interview types</Legend>
            <FieldHint id={ids.types}>Your first pick is preselected. You can switch type for each interview. Optional.</FieldHint>
            <div className="grid gap-3.5 sm:grid-cols-3">
              {typeOptions.map((option) => (
                <ChoiceCard
                  key={option.value}
                  name="interviewTypes"
                  value={option.value}
                  label={option.label}
                  tag={firstPick(values.interviewTypes, option.value)}
                  checked={values.interviewTypes.includes(option.value)}
                  onChange={(on) => update("interviewTypes", toggleChoice(values.interviewTypes, option.value, on))}
                />
              ))}
            </div>
            {errors.interviewTypes && <FieldError>{errors.interviewTypes}</FieldError>}
          </fieldset>
        </div>
        <SaveBar status={status} dirty={dirty} saving={saving} label="Save preferences" />
      </form>
    </Card>
  );
}

/* ── Weekly goal (this browser only) ────────────────────────────────────── */

export function WeeklyGoalCard({ goal, onChange }: { goal: number; onChange: (goal: number) => void }) {
  const ids = { input: useId(), hint: useId(), error: useId() };
  const [text, setText] = useState(String(goal));
  const valid = goalFromInput(text) !== null;

  return (
    <Card className="px-5 py-5 sm:px-6 sm:py-6">
      <Field>
        <Label htmlFor={ids.input}>Finished interviews per week</Label>
        <Input
          id={ids.input}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={text}
          aria-invalid={!valid || undefined}
          aria-describedby={[ids.hint, !valid && ids.error].filter(Boolean).join(" ")}
          onChange={(event) => {
            setText(event.target.value);
            const next = goalFromInput(event.target.value);
            if (next !== null) onChange(next);
          }}
          onBlur={() => !valid && setText(String(goal))}
          className="w-28 font-data"
        />
        {!valid && <FieldError id={ids.error}>Enter a whole number from 1.</FieldError>}
        <FieldHint id={ids.hint}>
          Saved in this browser only, not to your account. <Link href={ROUTES.analytics} className="rounded-control font-medium text-brand underline-offset-4 hover:underline focus-ring">Analytics</Link>{" "}
          compares it with the interviews you finish each week.
        </FieldHint>
      </Field>
    </Card>
  );
}

/* ── Interview allowance (GET /api/user/usage) ──────────────────────────── */

export interface Usage {
  totalUsed: number;
  maxUses: number;
  remaining: number;
  isLimitReached: boolean;
  windowLabel?: string;
}

export function UsageCard({ usage }: { usage: Usage | null | "error" }) {
  if (usage === null) {
    return (
      <Card className="flex flex-col gap-3 px-5 py-5 sm:px-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-1.5 w-full" />
      </Card>
    );
  }
  if (usage === "error") {
    return <Card className="px-5 py-5 text-small text-fg-muted sm:px-6">Your interview allowance didn&apos;t load. It&apos;s also shown when you set up an interview.</Card>;
  }
  const window = usage.windowLabel ?? "month";
  const share = usage.maxUses > 0 ? Math.min(100, (usage.totalUsed / usage.maxUses) * 100) : 0;
  return (
    <Card className="px-5 py-5 sm:px-6">
      <p className="flex items-baseline justify-between gap-4 text-small text-fg-muted">
        <span>Interviews this {window}</span>
        <span>
          <span className="font-data text-body font-semibold text-fg">{usage.totalUsed}</span>
          <span className="font-data"> / {usage.maxUses}</span>
        </span>
      </p>
      <div
        role="meter"
        aria-label={`Interviews used this ${window}`}
        aria-valuemin={0}
        aria-valuemax={usage.maxUses}
        aria-valuenow={Math.min(usage.totalUsed, usage.maxUses)}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-sunken"
      >
        <div className={cn("h-full rounded-full", usage.isLimitReached ? "bg-danger" : "bg-brand")} style={{ width: `${share}%` }} />
      </div>
      <p className={cn("mt-3 text-small", usage.isLimitReached ? "font-medium text-danger" : "text-fg-muted")}>
        {usage.isLimitReached ? (
          `You've used all your interviews this ${window}.`
        ) : (
          <>
            <span className="font-data">{usage.remaining}</span> left this {window}. Cancelled interviews count too.
          </>
        )}
      </p>
    </Card>
  );
}

/* ── Interview memory ───────────────────────────────────────────────────── */

export function MemoryCard({ canReset, onReset }: { canReset: boolean; onReset: () => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  async function confirm() {
    setBusy(true);
    const ok = await onReset();
    setBusy(false);
    setStatus(ok ? "done" : "error");
    if (ok) setOpen(false);
  }

  function openDialog() {
    setStatus("idle");
    setOpen(true);
  }

  return (
    <Card>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-small text-fg">
          When memory is available, a summary of each finished report is saved to your interview memory and used to choose
          topics for your next interviews. There&apos;s no setting to turn it off.
        </p>
        <Link
          href={ROUTES.memory}
          className="mt-3 inline-flex min-h-8 items-center gap-1 rounded-control text-small font-medium text-brand underline-offset-4 hover:underline focus-ring"
        >
          How memory works
          <ArrowRight aria-hidden strokeWidth={1.75} className="size-3.5" />
        </Link>
      </div>
      <div className="flex flex-col gap-3 border-t border-line-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <p className="text-small font-semibold text-fg">Reset memory</p>
          <p className="text-small text-fg-muted">
            {canReset
              ? "Deletes your saved interview memory. Your reports and profile stay."
              : "Available once your profile has loaded."}
          </p>
          <p aria-live="polite" className="text-small">
            {status === "done" && <span className="font-medium text-success">Memory reset.</span>}
          </p>
        </div>
        <Button variant="secondary" onClick={openDialog} disabled={!canReset} className="shrink-0">
          Reset memory
        </Button>
      </div>
      <Dialog
        open={open}
        onOpenChange={(next) => !busy && setOpen(next)}
        title="Reset interview memory?"
        description="This deletes the interview memory saved so far. Your reports, scores and profile are kept, and memory builds again from your next report. This can't be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
              Keep memory
            </Button>
            <Button variant="danger" onClick={() => void confirm()} loading={busy} disabled={busy}>
              {busy ? "Resetting" : "Reset memory"}
            </Button>
          </>
        }
      >
        {status === "error" && (
          <Alert tone="danger" title="Memory couldn't be reset">
            Something went wrong. Try again.
          </Alert>
        )}
      </Dialog>
    </Card>
  );
}

/* ── Delete account ─────────────────────────────────────────────────────── */

export function DeleteAccountCard({ onDelete }: { onDelete: () => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function confirm() {
    setBusy(true);
    setFailed(false);
    const ok = await onDelete();
    // On success the page signs out and leaves; only a failure comes back here.
    if (!ok) {
      setBusy(false);
      setFailed(true);
    }
  }

  return (
    <Card className="flex flex-col gap-3 border-danger-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="min-w-0 text-small text-fg">
        Deletes your account, profile, resume, interviews, reports and interview memory, and signs you out.
      </p>
      <Button
        variant="danger"
        onClick={() => {
          setFailed(false);
          setOpen(true);
        }}
        className="shrink-0"
      >
        Delete account
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => !busy && setOpen(next)}
        title="Delete your account?"
        description="Your account, profile, resume, interviews, reports and interview memory are deleted and you're signed out. This can't be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
              Keep account
            </Button>
            <Button variant="danger" onClick={() => void confirm()} loading={busy} disabled={busy}>
              {busy ? "Deleting" : "Delete account"}
            </Button>
          </>
        }
      >
        <p className="text-small text-fg-muted">
          We keep a record of your email, name and how many interviews you used. If you sign up again with the same email,
          interviews used in the current period still count toward your allowance.
        </p>
        {failed && (
          <Alert tone="danger" title="Your account wasn't deleted" className="mt-4">
            Something went wrong. Try again.
          </Alert>
        )}
      </Dialog>
    </Card>
  );
}
