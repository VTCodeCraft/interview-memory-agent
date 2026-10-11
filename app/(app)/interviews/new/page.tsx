"use client";

import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldError, FieldHint, Label } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { useInterview } from "@/hooks/useInterview";
import { ROUTES, routeTo } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";
import { OptionCard, Segmented } from "./_components/RadioControls";
import { CancelGenerationDialog, ConflictDialog } from "./_components/SetupDialogs";
import {
  GeneratingPanel,
  LimitReachedPanel,
  NextStepsPanel,
  Panel,
  ResumePanel,
  SetupSkeleton,
  UsagePanel,
  type ResumeInfo,
  type UsageInfo,
} from "./_components/SetupPanels";
import {
  COMPANIES,
  COMPANY_TYPES,
  INTERVIEW_TYPES,
  LEVELS,
  isLevel,
  isPresetCompany,
  levelLabel,
  typeFromProfileKey,
  typeLabel,
  type InterviewTypeValue,
  type Level,
} from "./_components/setup-options";

/** Same rule the server enforces for "Other" (POST /api/interview/start). */
const setupSchema = z
  .object({
    company: z.string().min(1),
    companyType: z.string().optional(),
    customCompanyName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.company === "Other") {
      if (!data.companyType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Choose the company type.", path: ["companyType"] });
      }
      if (!data.customCompanyName || data.customCompanyName.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter the company name.", path: ["customCompanyName"] });
      }
    }
  });

type Errors = Partial<Record<"companyType" | "customCompanyName" | "role", string>>;

/** Body for POST /api/interview/start (useInterview adds role and provider). */
interface StartPayload {
  company: string;
  companyType?: string;
  customCompanyName?: string;
  jobDescription: string;
  difficulty: Level;
  interviewType: InterviewTypeValue;
}

/** GET /api/user/usage; null when it fails (the panel is then hidden). */
async function fetchUsage(): Promise<UsageInfo | null> {
  try {
    const res = await fetch("/api/user/usage", { cache: "no-store" });
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * /interviews/new: interview setup. Creating + generating an interview uses
 * the existing start/generate APIs (hooks/useInterview); the live session
 * itself runs on /interviews/[id]/live after the /interviews/check step.
 */
export default function NewInterviewPage() {
  const router = useRouter();
  const { loading, error, start, cancel, conflict, clearConflict } = useInterview();
  // The role is sent from the settings store (useInterview reads it), pre-filled from the profile.
  const { targetRole, setTargetRole } = useSettingsStore();

  const [company, setCompany] = useState<string>("Google");
  const [companyType, setCompanyType] = useState("");
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [level, setLevel] = useState<Level>("MEDIUM");
  const [interviewType, setInterviewType] = useState<InterviewTypeValue>("Technical");
  const [jobDescription, setJobDescription] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Questions are ready and the voice check is opening. */
  const [opening, setOpening] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  /** Two-step confirm inside the conflict dialog. */
  const [conflictCancelConfirming, setConflictCancelConfirming] = useState(false);
  /** Last submitted payload, retried after cancelling a conflicting interview. */
  const lastPayloadRef = useRef<StartPayload | null>(null);
  /** Ensures the active-interview check runs once on mount (StrictMode-safe). */
  const hasCheckedActiveRef = useRef(false);
  /** True while checking for an unfinished interview to resume. */
  const [isCheckingActive, setIsCheckingActive] = useState(true);

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [resume, setResume] = useState<ResumeInfo | null>(null);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);

  const ids = {
    companyHint: useId(),
    customName: useId(),
    customNameError: useId(),
    companyTypeHint: useId(),
    companyTypeError: useId(),
    role: useId(),
    roleHint: useId(),
    roleError: useId(),
    levelHint: useId(),
    jd: useId(),
    jdHint: useId(),
  };
  const customNameRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const companyTypeGroupRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const refreshUsage = useCallback(async () => {
    const usage = await fetchUsage();
    if (usage) setUsageInfo(usage);
  }, []);
  /** Window label for the limit toast, read without re-running the error effect. */
  const windowLabelRef = useRef("month");
  useEffect(() => {
    windowLabelRef.current = usageInfo?.windowLabel ?? "month";
  }, [usageInfo]);

  // Pre-fill from the profile (role, level, first interview type and company) and load usage.
  useEffect(() => {
    async function fetchSetupData() {
      try {
        const res = await fetch("/api/user/profile");
        const json = await res.json();
        if (json.success) {
          const p = json.data.profile;
          if (p) {
            if (p.targetRole) setTargetRole(p.targetRole);
            if (isLevel(p.preferredDifficulty)) setLevel(p.preferredDifficulty);
            const type = typeFromProfileKey(p.interviewTypes?.[0]);
            if (type) setInterviewType(type);
            if (isPresetCompany(p.targetCompanies?.[0])) setCompany(p.targetCompanies[0]);
          }
          const latest = json.data.latestResume;
          setResume(latest ? { fileName: latest.originalFileName, uploadedAt: latest.uploadedAt } : null);
          setProfileLoaded(true);
          await refreshUsage();
        }
      } catch (err) {
        console.error(err);
      }
    }
    void fetchSetupData();
  }, [setTargetRole, refreshUsage]);

  useEffect(() => {
    if (!error) return;
    if (error === "INTERVIEW_LIMIT_REACHED") {
      toast.error(`You have reached the interview limit for this ${windowLabelRef.current}.`);
    } else if (error !== "ACTIVE_INTERVIEW_EXISTS") {
      // ACTIVE_INTERVIEW_EXISTS is handled by the conflict dialog, not a toast.
      toast.error(error);
    }
    // A new interview was consumed (or blocked): sync usage.
    let cancelled = false;
    fetchUsage().then((usage) => {
      if (!cancelled && usage) setUsageInfo(usage);
    });
    return () => {
      cancelled = true;
    };
  }, [error]);

  // An unfinished interview (refresh, reopened browser, new tab) resumes on its own route.
  useEffect(() => {
    if (hasCheckedActiveRef.current) return;
    hasCheckedActiveRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/interview/active", { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data?.interviewId) {
          router.replace(routeTo.liveInterview(json.data.interviewId));
          return;
        }
      } catch {
        // Network error: fall through to the setup form.
      }
      setIsCheckingActive(false);
    })();
  }, [router]);

  // The conflicting interview is still generating; the live page polls until it's ready.
  useEffect(() => {
    if (conflict?.status === "GENERATING") router.push(routeTo.liveInterview(conflict.interviewId));
  }, [conflict, router]);

  const companyName = company === "Other" ? customCompanyName.trim() || "Other company" : company;
  const summary = [targetRole.trim(), companyName, typeLabel(interviewType), levelLabel(level)].filter(Boolean).join(" · ");
  const windowLabel = usageInfo?.windowLabel ?? "month";
  const limitReached = Boolean(usageInfo?.isLimitReached);

  function validate(): boolean {
    const result = setupSchema.safeParse({ company, companyType, customCompanyName });
    const found: Errors = {};
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      if (fields.companyType?.[0]) found.companyType = fields.companyType[0];
      if (fields.customCompanyName?.[0]) found.customCompanyName = fields.customCompanyName[0];
    }
    // The server rejects an empty role too (POST /start); catch it here first.
    if (!targetRole.trim()) found.role = "Enter the role you're interviewing for.";
    setErrors(found);
    if (found.customCompanyName) customNameRef.current?.focus();
    else if (found.companyType) companyTypeGroupRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    else if (found.role) roleRef.current?.focus();
    return Object.keys(found).length === 0;
  }

  const handleStart = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    const payload =
      company === "Other"
        ? { company: "Other", companyType, customCompanyName, jobDescription, difficulty: level, interviewType }
        : { company, jobDescription, difficulty: level, interviewType };
    lastPayloadRef.current = payload;

    const interviewId = await start(payload);
    if (interviewId) {
      // Questions are ready: run the readiness check before going live.
      setOpening(true);
      router.push(routeTo.interviewCheck(interviewId));
      return; // stay in the "opening" state while navigating
    }
    setIsSubmitting(false);
  };

  /** Cancel the conflicting interview, then start this one. */
  const cancelConflictAndStart = async (existingInterviewId: string) => {
    setConflictCancelConfirming(false);
    clearConflict();
    await cancel(existingInterviewId); // aborts polling + marks it CANCELLED
    setIsSubmitting(true);
    const interviewId = await start(lastPayloadRef.current ?? undefined);
    if (interviewId) {
      setOpening(true);
      router.push(routeTo.interviewCheck(interviewId));
      return;
    }
    setIsSubmitting(false);
  };

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!limitReached) void handleStart();
  }

  /** Keep keyboard focus clear of the sticky action bar (below desktop), as on onboarding. */
  function keepFocusClearOfActions(event: FocusEvent<HTMLFormElement>) {
    const bar = actionsRef.current;
    const target = event.target as HTMLElement;
    if (!bar || bar.contains(target) || !target.matches(":focus-visible")) return;
    if (getComputedStyle(bar).position !== "sticky") return;
    const box = (target.closest("label") ?? target).getBoundingClientRect();
    const overlap = box.bottom + 12 - bar.getBoundingClientRect().top;
    if (overlap > 0) window.scrollBy({ top: overlap });
  }

  const generating = loading || opening || isSubmitting;

  return (
    <div className="ds-page flex-1">
      <main className="ds-container pt-8 pb-16 sm:pt-10 lg:pt-12 lg:pb-24">
        <header className="max-w-[44rem]">
          <p className="text-small font-medium text-fg-muted">New interview</p>
          <h1 className="ds-display mt-2 text-title text-balance text-fg">Set up your interview</h1>
          <p className="mt-2 text-body text-fg-muted">
            Choose the company, role and format. Questions are written for this session.
          </p>
        </header>

        <div className="mt-8">
          {isCheckingActive ? (
            <SetupSkeleton />
          ) : error === "INTERVIEW_LIMIT_REACHED" ? (
            <LimitReachedPanel usage={usageInfo} />
          ) : generating ? (
            <GeneratingPanel summary={summary} navigating={opening} onCancel={() => setIsCancelModalOpen(true)} />
          ) : (
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              <form
                noValidate
                onSubmit={onSubmit}
                onFocus={keepFocusClearOfActions}
                aria-label="Interview setup"
                className="min-w-0 lg:col-span-8"
              >
                {/* overflow-clip (not hidden) keeps the sticky action bar working. */}
                <Panel className="overflow-clip">
                  <div className="divide-y divide-line-subtle">
                    <Section>
                      <fieldset aria-describedby={ids.companyHint} className="flex flex-col gap-3">
                        <Legend>Company</Legend>
                        <FieldHint id={ids.companyHint}>Questions are tailored to the company you choose.</FieldHint>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                          {COMPANIES.map((option) => (
                            <OptionCard
                              key={option}
                              name="company"
                              value={option}
                              label={option}
                              checked={company === option}
                              onSelect={() => {
                                setCompany(option);
                                setErrors((current) => ({ ...current, companyType: undefined, customCompanyName: undefined }));
                              }}
                            />
                          ))}
                        </div>
                      </fieldset>

                      {company === "Other" && (
                        <div className="mt-6 grid gap-6 rounded-control border border-line bg-canvas p-4 sm:grid-cols-2 sm:p-5">
                          <Field>
                            <FieldLabel htmlFor={ids.customName}>Company name</FieldLabel>
                            <Input
                              ref={customNameRef}
                              id={ids.customName}
                              value={customCompanyName}
                              autoComplete="organization"
                              placeholder="e.g. Stripe"
                              onChange={(event) => {
                                setCustomCompanyName(event.target.value);
                                setErrors((current) => ({ ...current, customCompanyName: undefined }));
                              }}
                              aria-invalid={errors.customCompanyName ? true : undefined}
                              aria-describedby={errors.customCompanyName ? ids.customNameError : undefined}
                            />
                            {errors.customCompanyName && <FieldError id={ids.customNameError}>{errors.customCompanyName}</FieldError>}
                          </Field>
                          <fieldset className="flex flex-col gap-2" aria-describedby={ids.companyTypeHint}>
                            <Legend>Company type</Legend>
                            <div ref={companyTypeGroupRef}>
                              <Segmented
                                name="companyType"
                                value={companyType as (typeof COMPANY_TYPES)[number] | ""}
                                options={COMPANY_TYPES.map((type) => ({ value: type, label: type }))}
                                onChange={(type) => {
                                  setCompanyType(type);
                                  setErrors((current) => ({ ...current, companyType: undefined }));
                                }}
                                invalid={Boolean(errors.companyType)}
                                describedBy={errors.companyType ? ids.companyTypeError : ids.companyTypeHint}
                              />
                            </div>
                            <FieldHint id={ids.companyTypeHint}>Sets the style of the questions.</FieldHint>
                            {errors.companyType && <FieldError id={ids.companyTypeError}>{errors.companyType}</FieldError>}
                          </fieldset>
                        </div>
                      )}
                    </Section>

                    <Section>
                      <Field>
                        <FieldLabel htmlFor={ids.role}>Role</FieldLabel>
                        <Input
                          ref={roleRef}
                          id={ids.role}
                          value={targetRole}
                          maxLength={120}
                          autoComplete="off"
                          placeholder="e.g. Frontend Engineer"
                          onChange={(event) => {
                            setTargetRole(event.target.value);
                            setErrors((current) => ({ ...current, role: undefined }));
                          }}
                          aria-invalid={errors.role ? true : undefined}
                          aria-describedby={[ids.roleHint, errors.role ? ids.roleError : ""].filter(Boolean).join(" ")}
                        />
                        <FieldHint id={ids.roleHint}>
                          Filled in from your profile. Changing it here applies to this interview; your profile stays the same.
                        </FieldHint>
                        {errors.role && <FieldError id={ids.roleError}>{errors.role}</FieldError>}
                      </Field>
                    </Section>

                    <Section>
                      <fieldset className="flex flex-col gap-3">
                        <Legend>Interview type</Legend>
                        <div className="grid gap-2.5">
                          {INTERVIEW_TYPES.map((type) => (
                            <OptionCard
                              key={type.value}
                              name="interviewType"
                              value={type.value}
                              label={type.label}
                              description={type.description}
                              checked={interviewType === type.value}
                              onSelect={() => setInterviewType(type.value)}
                            />
                          ))}
                        </div>
                      </fieldset>
                    </Section>

                    <Section>
                      <fieldset className="flex flex-col gap-3">
                        <Legend>Level</Legend>
                        <Segmented name="difficulty" value={level} options={LEVELS} onChange={setLevel} describedBy={ids.levelHint} />
                        <FieldHint id={ids.levelHint}>How demanding the questions are.</FieldHint>
                      </fieldset>
                    </Section>

                    <Section>
                      <Field>
                        <FieldLabel htmlFor={ids.jd} optional>
                          Job description
                        </FieldLabel>
                        <Textarea
                          id={ids.jd}
                          rows={5}
                          value={jobDescription}
                          onChange={(event) => setJobDescription(event.target.value)}
                          placeholder="Paste the job posting"
                          aria-describedby={ids.jdHint}
                        />
                        <FieldHint id={ids.jdHint}>
                          Focuses the questions on the posting&apos;s requirements. It&apos;s saved with this interview only.
                        </FieldHint>
                      </Field>
                    </Section>
                  </div>

                  {limitReached && (
                    <div className="px-5 pb-6 sm:px-8">
                      <Alert tone="warning" title={`You've used all your interviews this ${windowLabel}`}>
                        You can start a new one next {windowLabel}.
                      </Alert>
                    </div>
                  )}

                  {/* Below desktop the action bar sticks to the bottom of the screen. */}
                  <div
                    ref={actionsRef}
                    className="z-10 flex items-center gap-3 border-t border-line-subtle bg-panel px-5 py-3 max-lg:sticky max-lg:bottom-0 sm:px-8 sm:py-5"
                  >
                    <Link href={ROUTES.interviews} className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "px-3 sm:-ml-3")}>
                      Cancel
                    </Link>
                    <Button type="submit" size="lg" disabled={limitReached} className="flex-1 sm:ml-auto sm:flex-none">
                      <Mic aria-hidden strokeWidth={1.75} />
                      Start interview
                    </Button>
                  </div>
                </Panel>
              </form>

              <aside aria-label="Before you start" className="flex min-w-0 flex-col gap-6 lg:col-span-4">
                {usageInfo && <UsagePanel usage={usageInfo} />}
                {profileLoaded && <ResumePanel resume={resume} />}
                <NextStepsPanel />
              </aside>
            </div>
          )}
        </div>
      </main>

      <ConflictDialog
        conflict={conflict}
        confirming={conflictCancelConfirming}
        onConfirmingChange={setConflictCancelConfirming}
        onDismiss={clearConflict}
        onContinue={() => conflict && router.push(routeTo.liveInterview(conflict.interviewId))}
        onCancelGenerating={async () => {
          if (!conflict) return;
          const existingId = conflict.interviewId;
          clearConflict();
          await cancel(existingId);
        }}
        onCancelAndStart={() => conflict && void cancelConflictAndStart(conflict.interviewId)}
      />
      <CancelGenerationDialog
        open={isCancelModalOpen}
        windowLabel={windowLabel}
        onOpenChange={setIsCancelModalOpen}
        onConfirm={async () => {
          setIsCancelModalOpen(false);
          // Back to the form right away, as before (cancel() also aborts the pending request).
          setIsSubmitting(false);
          await cancel();
          await refreshUsage();
        }}
      />
    </div>
  );
}

function Section({ children }: { children: ReactNode }) {
  return <div className="px-5 py-6 sm:px-8 sm:py-7">{children}</div>;
}

function Legend({ children }: { children: ReactNode }) {
  return (
    <legend className="mb-2 text-small font-semibold text-fg">
      {children} <span className="text-label font-medium text-fg-muted">(required)</span>
    </legend>
  );
}

function FieldLabel({ htmlFor, optional, children }: { htmlFor: string; optional?: boolean; children: ReactNode }) {
  return (
    <Label htmlFor={htmlFor}>
      {children}{" "}
      <span className={cn("text-label font-medium", optional ? "text-fg-subtle" : "text-fg-muted")}>
        {optional ? "(optional)" : "(required)"}
      </span>
    </Label>
  );
}
