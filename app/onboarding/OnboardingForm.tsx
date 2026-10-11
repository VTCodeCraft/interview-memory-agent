"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, AudioLines, Check, CircleCheck, FileText } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldHint, Label } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Spinner } from "@/components/ui/feedback";
import { sanitizeAppRedirect } from "@/lib/routing/redirect";
import { ROUTES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";
import { ChoiceCard } from "./_components/ChoiceCard";
import { SegmentedRadio } from "./_components/SegmentedRadio";
import {
  COMPANY_OPTIONS,
  DIFFICULTY_OPTIONS,
  EXPERIENCE_OPTIONS,
  INTERVIEW_TYPE_OPTIONS,
  type Difficulty,
  type OnboardingInitial,
  type SavedResume,
} from "./_components/options";
import { ResumeUpload } from "./_components/ResumeUpload";

const ONBOARDING_ENDPOINT = "/api/user/onboarding";

const STEPS = [
  { title: "Your goal", summary: "Role, experience and companies" },
  { title: "Interview preferences", summary: "Interview types and level" },
  { title: "Resume", summary: "Upload once, reused every time" },
] as const;

type StepIndex = 0 | 1 | 2;

interface Values {
  targetRole: string;
  experience: string;
  targetCompanies: string[];
  interviewTypes: string[];
  preferredDifficulty: Difficulty;
}

type Errors = Partial<Record<"targetRole" | "experience" | "resume", string>>;

/** Adds values saved earlier that are no longer in the preset list, so nothing is dropped silently. */
function withSaved(options: readonly string[], saved: readonly string[]) {
  return [...options, ...saved.filter((value) => value && !options.includes(value))];
}

/** Joins element ids for aria-describedby, skipping empty ones. */
function idList(...items: (string | false | undefined)[]) {
  return items.filter(Boolean).join(" ");
}

/** Toggles a value, keeping selection order: the first pick is the one interview setup preselects. */
function toggle(list: string[], value: string, on: boolean) {
  return on ? (list.includes(value) ? list : [...list, value]) : list.filter((item) => item !== value);
}

/** "First pick" tag for the option interview setup will preselect, once there's more than one pick. */
function firstPick(list: string[], value: string) {
  return list.length > 1 && list[0] === value ? "First pick" : undefined;
}

function validateGoal(values: Values): Errors {
  const errors: Errors = {};
  if (!values.targetRole.trim()) errors.targetRole = "Enter the role you're preparing for.";
  if (!values.experience) errors.experience = "Choose your experience level.";
  return errors;
}

function submitError(status: number, body: unknown): string {
  const payload = (body ?? {}) as { message?: unknown; errors?: unknown };
  if (status === 401) return "Your session has ended. Sign in again to finish setup; your resume is already saved.";
  if (status === 422 && Array.isArray(payload.errors) && payload.errors.length > 0) {
    // Server messages look like "targetRole: Target role is required"; drop the field key.
    const details = payload.errors.map((item) => String(item).replace(/^[\w.]+:\s*/, ""));
    return `Some answers couldn't be saved: ${details.join("; ")}.`;
  }
  if (status === 429) return "Too many attempts. Wait a minute, then try again.";
  return "We couldn't save your setup. Please try again.";
}

/**
 * Three-step setup. Answers live here across steps (nothing is lost moving
 * back and forth); the resume uploads on its own as soon as it's picked, and
 * "Finish setup" saves the profile through POST /api/user/onboarding, which
 * validates it again on the server.
 */
export default function OnboardingForm({
  next,
  initial,
  savedResume,
}: {
  next: string | null;
  initial: OnboardingInitial;
  savedResume: SavedResume | null;
}) {
  const router = useRouter();
  const setStoredTargetRole = useSettingsStore((state) => state.setTargetRole);

  const [step, setStep] = useState<StepIndex>(0);
  const [visited, setVisited] = useState<StepIndex>(0);
  const [values, setValues] = useState<Values>(() => ({
    targetRole: initial.targetRole,
    experience: initial.experience,
    targetCompanies: initial.targetCompanies,
    interviewTypes: initial.interviewTypes,
    preferredDifficulty: initial.preferredDifficulty,
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [resume, setResume] = useState<SavedResume | null>(savedResume);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"editing" | "saving" | "done">("editing");
  const [formError, setFormError] = useState<string | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const experienceRef = useRef<HTMLSelectElement>(null);
  const movedRef = useRef(false);
  const ids = {
    heading: useId(),
    role: useId(),
    roleHint: useId(),
    roleError: useId(),
    experience: useId(),
    experienceHint: useId(),
    experienceError: useId(),
    companiesHint: useId(),
    typesHint: useId(),
    difficultyHint: useId(),
    resumeHint: useId(),
  };

  const experienceOptions = useMemo(() => withSaved(EXPERIENCE_OPTIONS, [initial.experience]), [initial.experience]);
  const companyOptions = useMemo(() => withSaved(COMPANY_OPTIONS, initial.targetCompanies), [initial.targetCompanies]);
  const typeOptions = useMemo(
    () => [
      ...INTERVIEW_TYPE_OPTIONS,
      ...initial.interviewTypes
        .filter((value) => !INTERVIEW_TYPE_OPTIONS.some((option) => option.value === value))
        .map((value) => ({ value, label: value, description: "" })),
    ],
    [initial.interviewTypes],
  );

  const dirty =
    status !== "done" &&
    (values.targetRole !== initial.targetRole ||
      values.experience !== initial.experience ||
      values.preferredDifficulty !== initial.preferredDifficulty ||
      values.targetCompanies.join() !== initial.targetCompanies.join() ||
      values.interviewTypes.join() !== initial.interviewTypes.join());

  // Warn before a reload, tab close or link click throws away unsaved answers.
  // (The resume needs no guard: it's saved the moment it uploads.)
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      if (!window.confirm("Leave setup? Your answers haven't been saved yet.")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  // Move focus to the new step's heading (not on first render).
  useEffect(() => {
    if (!movedRef.current) return;
    headingRef.current?.focus();
  }, [step]);

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const goTo = (target: StepIndex) => {
    movedRef.current = true;
    setFormError(null);
    setStep(target);
    setVisited((current) => (target > current ? target : current));
  };

  /** Validates step 1 and focuses the first problem. Returns true when valid. */
  const checkGoal = () => {
    const found = validateGoal(values);
    setErrors((current) => ({ ...current, targetRole: found.targetRole, experience: found.experience }));
    if (found.targetRole) roleRef.current?.focus();
    else if (found.experience) experienceRef.current?.focus();
    return !found.targetRole && !found.experience;
  };

  const onResumeUploaded = useCallback((saved: SavedResume) => {
    setResume(saved);
    setErrors((current) => ({ ...current, resume: undefined }));
  }, []);

  async function finish() {
    if (Object.keys(validateGoal(values)).length > 0) {
      goTo(0);
      setErrors(validateGoal(values));
      return;
    }
    if (!resume) {
      setErrors((current) => ({ ...current, resume: "Upload your resume to finish setup." }));
      return;
    }

    setStatus("saving");
    setFormError(null);
    try {
      const response = await fetch(ONBOARDING_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: values.targetRole.trim(),
          experience: values.experience,
          // Edited in Profile & Settings, not here: sent back unchanged so saving doesn't clear them.
          githubUrl: initial.githubUrl,
          linkedinUrl: initial.linkedinUrl,
          preferredInterviewMode: "VOICE",
          preferredDifficulty: values.preferredDifficulty,
          targetCompanies: values.targetCompanies,
          interviewTypes: values.interviewTypes,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.success) {
        setStatus("editing");
        setFormError(submitError(response.status, body));
        return;
      }
    } catch {
      setStatus("editing");
      setFormError("We couldn't reach the server. Check your connection and try again.");
      return;
    }

    setStoredTargetRole(values.targetRole.trim());
    setStatus("done");
    router.push(sanitizeAppRedirect(next) ?? ROUTES.interviews);
  }

  /**
   * Below desktop the action bar is sticky, and browsers don't scroll a
   * keyboard-focused control out from under it when the control is already on
   * screen. Nudge the page by the overlap (keyboard focus only, so taps and
   * clicks never move the content).
   */
  function keepFocusClearOfActions(event: FocusEvent<HTMLFormElement>) {
    const bar = actionsRef.current;
    const target = event.target as HTMLElement;
    if (!bar || bar.contains(target) || !target.matches(":focus-visible")) return;
    if (getComputedStyle(bar).position !== "sticky") return;
    const box = (target.closest("label") ?? target).getBoundingClientRect();
    const overlap = box.bottom + 12 - bar.getBoundingClientRect().top;
    if (overlap > 0) window.scrollBy({ top: overlap });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "editing" || uploading) return;
    if (step === 0) {
      if (checkGoal()) goTo(1);
    } else if (step === 1) {
      goTo(2);
    } else {
      void finish();
    }
  }

  const current = STEPS[step];
  const saving = status === "saving";

  return (
    <div className="ds-container pt-6 pb-16 sm:pt-10 lg:pt-16 lg:pb-24">
      {/* Same container as the header and footer, so left and right edges line up. */}
      <div className="grid max-w-[42rem] gap-6 sm:gap-8 lg:max-w-none lg:grid-cols-12 lg:gap-x-8 xl:gap-x-12">
        {/* Intro and progress. Below desktop the intro shows in full on step 1
            only; later steps keep just the title so the form starts higher. */}
        <aside className="lg:sticky lg:top-8 lg:col-span-4 lg:self-start">
          <p className={cn("text-small font-medium text-fg-muted", step > 0 && "max-lg:hidden")}>
            Account setup
          </p>
          <h1 className={cn("ds-display text-title text-balance text-fg", step === 0 ? "mt-3" : "lg:mt-3")}>
            Set up your interview coach
          </h1>
          <p className={cn("mt-3 max-w-[38ch] text-body text-fg-muted", step > 0 && "max-lg:hidden")}>
            Three short steps to tailor your practice interviews.
          </p>

          <ol aria-label="Setup steps" className="mt-8 hidden flex-col gap-1 lg:flex">
            {STEPS.map((item, index) => {
              const position = index as StepIndex;
              const isCurrent = position === step;
              const isDone = position < visited && !isCurrent;
              const reachable = position <= visited && status === "editing" && !uploading;
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    disabled={!reachable || isCurrent}
                    aria-current={isCurrent ? "step" : undefined}
                    onClick={() => {
                      if (position > step && step === 0 && !checkGoal()) return;
                      goTo(position);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-control px-3 py-2.5 text-left transition-[background-color] duration-(--duration-fast) ease-standard focus-ring",
                      isCurrent ? "bg-panel shadow-control ring-1 ring-line" : reachable ? "hover:bg-sunken" : "",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-px flex size-6 shrink-0 items-center justify-center rounded-full font-data text-label tabular-nums",
                        isCurrent
                          ? "bg-brand text-on-brand"
                          : isDone
                            ? "bg-brand-soft text-brand ring-1 ring-memory-line ring-inset"
                            : "bg-panel text-fg-subtle ring-1 ring-line ring-inset",
                      )}
                    >
                      {isDone ? <Check strokeWidth={2.5} className="size-3.5" /> : index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block text-small font-semibold", isCurrent || isDone ? "text-fg" : "text-fg-muted")}>
                        {item.title}
                        {isDone && <span className="sr-only"> (completed)</span>}
                      </span>
                      <span className="block text-small text-fg-muted">{item.summary}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Form card */}
        {/* overflow-clip (not hidden) keeps the sticky action bar working. */}
        <section
          aria-labelledby={ids.heading}
          className="ds-surface min-w-0 overflow-clip rounded-card lg:col-span-8 xl:col-span-7 xl:col-start-6"
        >
          {status === "done" ? (
            <div role="status" className="flex flex-col items-center px-6 py-16 text-center sm:px-10">
              <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success ring-1 ring-success-line ring-inset">
                <CircleCheck strokeWidth={1.75} className="size-6" />
              </span>
              <h2 id={ids.heading} className="ds-display mt-5 text-heading text-fg">
                You&apos;re all set
              </h2>
              <p className="mt-2 max-w-[36ch] text-body text-fg-muted">
                Your setup is saved. Taking you to {next ? "where you left off" : "your dashboard"}.
              </p>
              <Spinner label="Opening" className="mt-6" />
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} onFocus={keepFocusClearOfActions} aria-busy={saving || undefined}>
              {/* Step header */}
              <div className="border-b border-line-subtle px-5 pt-5 pb-5 sm:px-8 sm:pt-7">
                <div className="flex items-center justify-between gap-4 lg:hidden">
                  <p className="text-small font-medium text-fg-muted">
                    Step <span className="font-data tabular-nums text-fg">{step + 1}</span> of{" "}
                    <span className="font-data tabular-nums">{STEPS.length}</span>
                  </p>
                  <div aria-hidden className="flex gap-1.5">
                    {STEPS.map((item, index) => (
                      <span
                        key={item.title}
                        className={cn(
                          "h-1 w-8 rounded-full transition-[background-color] duration-(--duration-base) ease-standard sm:w-10",
                          index <= step ? "bg-brand" : "bg-line",
                        )}
                      />
                    ))}
                  </div>
                </div>
                <h2 id={ids.heading} ref={headingRef} tabIndex={-1} className="ds-display mt-4 text-heading text-fg outline-none lg:mt-0">
                  {current.title}
                </h2>
                <p className="mt-1.5 text-body text-fg-muted">
                  {step === 0 && "Tell us what you're preparing for."}
                  {step === 1 && "What you want to practice, and how demanding it should be."}
                  {step === 2 && "Your interviewer asks about the projects and experience in your resume."}
                </p>
              </div>

              <div className="flex flex-col gap-8 px-5 py-7 sm:px-8 sm:py-8">
                {step === 0 && (
                  <>
                    <Field>
                      <FieldLabel htmlFor={ids.role} required>
                        Target role
                      </FieldLabel>
                      <Input
                        ref={roleRef}
                        id={ids.role}
                        name="targetRole"
                        autoComplete="off"
                        placeholder="e.g. Frontend Engineer"
                        maxLength={120}
                        value={values.targetRole}
                        onChange={(event) => update("targetRole", event.target.value)}
                        aria-invalid={errors.targetRole ? true : undefined}
                        aria-describedby={idList(ids.roleHint, errors.targetRole && ids.roleError)}
                      />
                      <FieldHint id={ids.roleHint}>Questions are written for this role.</FieldHint>
                      {errors.targetRole && <FieldError id={ids.roleError}>{errors.targetRole}</FieldError>}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={ids.experience} required>
                        Experience
                      </FieldLabel>
                      <Select
                        ref={experienceRef}
                        id={ids.experience}
                        name="experience"
                        value={values.experience}
                        onChange={(event) => update("experience", event.target.value)}
                        aria-invalid={errors.experience ? true : undefined}
                        aria-describedby={idList(ids.experienceHint, errors.experience && ids.experienceError)}
                        className={cn(!values.experience && "text-fg-subtle")}
                      >
                        <option value="" disabled>
                          Select your years of experience
                        </option>
                        {experienceOptions.map((option) => (
                          <option key={option} value={option} className="text-fg">
                            {option}
                          </option>
                        ))}
                      </Select>
                      <FieldHint id={ids.experienceHint}>Saved to your profile. Interview level comes next.</FieldHint>
                      {errors.experience && <FieldError id={ids.experienceError}>{errors.experience}</FieldError>}
                    </Field>

                    <fieldset aria-describedby={ids.companiesHint} className="flex flex-col gap-3">
                      <Legend optional>Target companies</Legend>
                      <FieldHint id={ids.companiesHint}>
                        Questions are tailored to the company, and your first pick is preselected. Any other company can
                        be entered during interview setup.
                      </FieldHint>
                      <div className="grid grid-cols-2 gap-x-2.5 gap-y-3.5 sm:grid-cols-3">
                        {companyOptions.map((company) => (
                          <ChoiceCard
                            key={company}
                            name="targetCompanies"
                            value={company}
                            label={company}
                            tag={firstPick(values.targetCompanies, company)}
                            checked={values.targetCompanies.includes(company)}
                            onChange={(on) => update("targetCompanies", toggle(values.targetCompanies, company, on))}
                          />
                        ))}
                      </div>
                    </fieldset>
                  </>
                )}

                {step === 1 && (
                  <>
                    <fieldset aria-describedby={ids.typesHint} className="flex flex-col gap-3">
                      <Legend optional>Interview types</Legend>
                      <FieldHint id={ids.typesHint}>Your first pick is preselected. You can switch type for each interview.</FieldHint>
                      <div className="grid gap-3.5">
                        {typeOptions.map((option) => (
                          <ChoiceCard
                            key={option.value}
                            name="interviewTypes"
                            value={option.value}
                            label={option.label}
                            description={option.description || undefined}
                            tag={firstPick(values.interviewTypes, option.value)}
                            checked={values.interviewTypes.includes(option.value)}
                            onChange={(on) => update("interviewTypes", toggle(values.interviewTypes, option.value, on))}
                          />
                        ))}
                      </div>
                    </fieldset>

                    <fieldset className="flex flex-col gap-3">
                      <Legend required>Interview level</Legend>
                      <FieldHint id={ids.difficultyHint}>How demanding the questions are. You can change it for any interview.</FieldHint>
                      <SegmentedRadio
                        name="preferredDifficulty"
                        value={values.preferredDifficulty}
                        options={DIFFICULTY_OPTIONS}
                        onChange={(level) => update("preferredDifficulty", level)}
                        describedBy={ids.difficultyHint}
                      />
                    </fieldset>

                    <ul className="flex flex-col gap-3 rounded-control bg-sunken p-4 text-small text-fg-muted sm:p-5">
                      <Note icon={<AudioLines strokeWidth={1.75} className="size-4" />}>
                        Interviews are spoken, with a live transcript on screen.
                      </Note>
                      <Note icon={<FileText strokeWidth={1.75} className="size-4" />}>
                        Paste a job description when you set up an interview. It applies to that interview only.
                      </Note>
                    </ul>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="flex flex-col gap-3">
                      <p className="-mb-1 text-small font-semibold text-fg">
                        PDF resume <RequiredMark />
                      </p>
                      <FieldHint id={ids.resumeHint}>
                        Upload once: the text is reused in every interview, and a new upload replaces it. The PDF file
                        itself isn&apos;t kept.
                      </FieldHint>
                      <ResumeUpload
                        saved={resume}
                        onUploaded={onResumeUploaded}
                        onBusyChange={setUploading}
                        missingError={errors.resume}
                        describedById={ids.resumeHint}
                      />
                    </div>

                    <div>
                      <h3 className="text-small font-semibold text-fg">Review your answers</h3>
                      <dl className="mt-3 divide-y divide-line-subtle rounded-control border border-line">
                        <SummaryRow label="Target role" value={values.targetRole.trim()} onEdit={() => goTo(0)} disabled={saving || uploading} />
                        <SummaryRow label="Experience" value={values.experience} onEdit={() => goTo(0)} disabled={saving || uploading} />
                        <SummaryRow
                          label="Companies"
                          value={values.targetCompanies.join(", ") || "None selected"}
                          muted={values.targetCompanies.length === 0}
                          onEdit={() => goTo(0)}
                          disabled={saving || uploading}
                        />
                        <SummaryRow
                          label="Interview types"
                          value={
                            values.interviewTypes
                              .map((value) => typeOptions.find((option) => option.value === value)?.label ?? value)
                              .join(", ") || "None selected"
                          }
                          muted={values.interviewTypes.length === 0}
                          onEdit={() => goTo(1)}
                          disabled={saving || uploading}
                        />
                        <SummaryRow
                          label="Level"
                          value={DIFFICULTY_OPTIONS.find((option) => option.value === values.preferredDifficulty)?.label ?? ""}
                          onEdit={() => goTo(1)}
                          disabled={saving || uploading}
                        />
                      </dl>
                    </div>
                  </>
                )}

                {formError && (
                  <Alert tone="danger" title="Setup wasn't saved">
                    {formError}
                  </Alert>
                )}
              </div>

              {/* Actions. Below desktop the bar sticks to the bottom of the screen
                  while the form scrolls, so the next step is always one tap away. */}
              <div
                ref={actionsRef}
                className="z-10 flex items-center gap-3 border-t border-line-subtle bg-panel px-5 py-3 max-lg:sticky max-lg:bottom-0 sm:px-8 sm:py-5"
              >
                {step > 0 && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => goTo((step - 1) as StepIndex)}
                    disabled={saving || uploading}
                    className="px-3 sm:-ml-3"
                  >
                    <ArrowLeft aria-hidden strokeWidth={1.75} />
                    Back
                  </Button>
                )}
                <Button type="submit" size="lg" loading={saving} disabled={uploading} className="flex-1 sm:ml-auto sm:flex-none">
                  {step < 2 ? (
                    <>
                      Continue
                      <ArrowRight aria-hidden strokeWidth={1.75} />
                    </>
                  ) : saving ? (
                    "Saving setup"
                  ) : (
                    "Finish setup"
                  )}
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

function RequiredMark() {
  return <span className="text-label font-medium text-fg-muted">(required)</span>;
}

function OptionalMark() {
  return <span className="text-label font-medium text-fg-subtle">(optional)</span>;
}

function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <Label htmlFor={htmlFor}>
      {children} {required ? <RequiredMark /> : <OptionalMark />}
    </Label>
  );
}

function Legend({ required, optional, children }: { required?: boolean; optional?: boolean; children: ReactNode }) {
  return (
    <legend className="mb-2 text-small font-semibold text-fg">
      {children} {required && <RequiredMark />}
      {optional && <OptionalMark />}
    </legend>
  );
}

function Note({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-0.5 shrink-0 text-fg-subtle">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

function SummaryRow({
  label,
  value,
  muted,
  onEdit,
  disabled,
}: {
  label: string;
  value: string;
  muted?: boolean;
  onEdit: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 pr-1.5 pl-4">
      <div className="min-w-0 flex-1 py-1.5 sm:flex sm:gap-4">
        <dt className="text-small text-fg-muted sm:w-32 sm:shrink-0">{label}</dt>
        <dd className={cn("text-small font-medium break-words", muted ? "text-fg-subtle" : "text-fg")}>{value}</dd>
      </div>
      {/* At least 44 x 40px to tap. */}
      <Button
        variant="ghost"
        onClick={onEdit}
        disabled={disabled}
        className="h-10 min-w-11 px-3 text-small text-brand hover:text-brand-hover"
      >
        Edit<span className="sr-only"> {label.toLowerCase()}</span>
      </Button>
    </div>
  );
}
