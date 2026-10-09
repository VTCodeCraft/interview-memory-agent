"use client";

import { useState, type RefObject } from "react";
import { CircleHelp } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field, FieldError, FieldHint, Label } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Direction } from "./directions";
import { contrastRatio, formatHex, useCssVars, wcagLevel } from "./tokens-runtime";

const TYPE_RAMP = [
  { token: "display", role: "Hero headline", sample: "Starts where you left off.", className: "ds-display text-display" },
  { token: "headline", role: "Section headline", sample: "Practice that compounds.", className: "ds-display text-headline" },
  { token: "title", role: "Page and card title", sample: "System design interview", className: "ds-display text-title" },
  { token: "heading", role: "Panel heading", sample: "What changed since last time", className: "text-heading" },
  { token: "lead", role: "Intro paragraph", sample: "Every session leaves a record the next one builds on.", className: "text-lead text-fg-muted" },
  { token: "body", role: "Body and UI", sample: "The interviewer follows up the way a real panel does.", className: "text-body" },
  { token: "small", role: "Secondary text", sample: "Stripe, senior backend engineer, 32 min", className: "text-small text-fg-muted" },
  { token: "label", role: "Labels and meta", sample: "Capacity estimation", className: "text-label text-fg-subtle" },
  { token: "metric", role: "Scores", sample: "74", className: "ds-display text-metric tabular-nums" },
];

const SWATCH_GROUPS = [
  { title: "Surfaces", names: ["canvas", "panel", "sunken", "line", "line-control"] },
  { title: "Text", names: ["fg", "fg-muted", "fg-subtle", "inverse"] },
  { title: "Action and accent", names: ["action", "brand", "brand-ink", "brand-soft", "memory-soft"] },
  { title: "Status", names: ["success", "warning", "danger", "info"] },
  { title: "Charts", names: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-baseline"] },
];

/** [label, foreground, background, kind] - background composited over canvas. */
const CONTRAST_PAIRS: Array<[string, string, string, "text" | "ui"]> = [
  ["Body text on canvas", "fg", "canvas", "text"],
  ["Muted text on panel", "fg-muted", "panel", "text"],
  ["Subtle text on sunken", "fg-subtle", "sunken", "text"],
  ["Primary button label", "on-action", "action", "text"],
  ["Accent link on panel", "brand", "panel", "text"],
  ["Memory text on memory tint", "memory", "memory-soft", "text"],
  ["Warning text on panel", "warning", "panel", "text"],
  ["Control border on panel", "line-control", "panel", "ui"],
  ["Focus ring on canvas", "focus", "canvas", "ui"],
];

const ALL_VARS = Array.from(
  new Set([
    ...SWATCH_GROUPS.flatMap((group) => group.names),
    ...CONTRAST_PAIRS.flatMap(([, fg, bg]) => [fg, bg]),
  ]),
).map((name) => `--color-${name}`);

function Block({ id, title, intro, children }: { id: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t border-line pt-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-3">
        <h3 id={id} className="text-subheading text-fg">
          {title}
        </h3>
        <p className="mt-1.5 text-small text-fg-muted">{intro}</p>
      </div>
      <div className="min-w-0 lg:col-span-9">{children}</div>
    </section>
  );
}

function Specimen({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("ds-surface flex flex-col gap-4 rounded-card p-5", className)}>
      <p className="text-label font-semibold text-fg-subtle">{label}</p>
      {children}
    </div>
  );
}

/**
 * The selected direction's tokens and components, read from the rendered
 * CSS. A design tool section under the site specimen, not website content.
 */
export function SystemSheet({ direction, scopeRef }: { direction: Direction; scopeRef: RefObject<HTMLElement | null> }) {
  const vars = useCssVars(ALL_VARS, scopeRef, [direction.id]);
  const color = (name: string) => vars[`--color-${name}`] ?? "";
  const canvas = color("canvas") || "#ffffff";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [remember, setRemember] = useState(true);
  const [reminders, setReminders] = useState(true);

  return (
    <section
      id="system"
      aria-labelledby="system-title"
      className="mt-(--spacing-section) scroll-mt-20 border-t border-dashed border-line-strong"
    >
      <div className="ds-container pt-16">
        <div className="flex flex-col gap-3 pb-10">
          <p className="text-small font-medium text-fg-muted">Design preview tool, not website content</p>
          <h2 id="system-title" className="ds-display text-headline text-fg">
            {direction.name} system sheet
          </h2>
          <p className="max-w-[40rem] text-body text-fg-muted">
            Every value below is read from the CSS rendering this page, so it always matches what you see above.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          <Block id="sys-type" title="Typography" intro={`Display: ${direction.fonts.display}. UI: ${direction.fonts.ui}. Data: ${direction.fonts.data}.`}>
            <ul className="divide-y divide-line-subtle">
              {TYPE_RAMP.map((row) => (
                <li key={row.token} className="grid gap-2 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <div>
                    <p className="font-data text-label text-fg">text-{row.token}</p>
                    <p className="text-label font-normal text-fg-subtle">{row.role}</p>
                  </div>
                  <p className={cn("min-w-0 text-fg", row.className)}>{row.sample}</p>
                </li>
              ))}
            </ul>
          </Block>

          <Block id="sys-color" title="Colour" intro="Hex values as rendered. Text contrast is checked against WCAG 2.2 AA.">
            <div className="flex flex-col gap-8">
              {SWATCH_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-label font-semibold text-fg-subtle">{group.title}</p>
                  <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {group.names.map((name) => (
                      <li key={name} className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="size-10 shrink-0 rounded-control ring-1 ring-fg/10 ring-inset"
                          style={{ backgroundColor: `var(--color-${name})` }}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-small font-medium text-fg">{name}</span>
                          <span className="block truncate font-data text-label text-fg-subtle">{formatHex(color(name))}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <p className="text-label font-semibold text-fg-subtle">Contrast checks</p>
                <ul className="mt-3 divide-y divide-line-subtle rounded-card border border-line">
                  {CONTRAST_PAIRS.map(([label, fg, bg, kind]) => {
                    const ratio = contrastRatio(color(fg), color(bg), canvas);
                    const level = wcagLevel(ratio, kind);
                    return (
                      <li key={label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-small">
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            aria-hidden
                            className="inline-flex size-6 shrink-0 items-center justify-center rounded-badge text-label font-semibold ring-1 ring-fg/10 ring-inset"
                            style={{ backgroundColor: `var(--color-${bg})`, color: `var(--color-${fg})` }}
                          >
                            Aa
                          </span>
                          <span className="truncate text-fg">{label}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="font-data tabular-nums text-fg-muted">{ratio ? `${ratio.toFixed(2)}:1` : "..."}</span>
                          <Badge tone={level === "Fail" ? "danger" : "success"}>{level}</Badge>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </Block>

          <Block id="sys-components" title="Components" intro="Shared components from components/ui, restyled only through tokens.">
            <div className="grid gap-4 md:grid-cols-2">
              <Specimen label="Buttons" className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Button>Start practicing</Button>
                  <Button variant="accent">Start next session</Button>
                  <Button variant="secondary">See a sample report</Button>
                  <Button variant="ghost">Cancel</Button>
                  <Button variant="link">View transcript</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                  <Button loading>Saving</Button>
                  <Button disabled>Disabled</Button>
                  <Button variant="danger">End interview</Button>
                </div>
              </Specimen>

              <Specimen label="Form">
                <Field>
                  <Label htmlFor="sys-role">Target role</Label>
                  <Input id="sys-role" placeholder="e.g. Senior backend engineer" aria-describedby="sys-role-hint" />
                  <FieldHint id="sys-role-hint">Used to shape questions and feedback.</FieldHint>
                </Field>
                <Field>
                  <Label htmlFor="sys-type">Interview type</Label>
                  <Select id="sys-type" defaultValue="system">
                    <option value="system">System design</option>
                    <option value="behavioural">Behavioural</option>
                    <option value="coding">Coding</option>
                  </Select>
                </Field>
                <Field>
                  <Label htmlFor="sys-company">Company</Label>
                  <Input id="sys-company" aria-invalid aria-describedby="sys-company-error" />
                  <FieldError id="sys-company-error">Add a company so questions match its bar.</FieldError>
                </Field>
              </Specimen>

              <div className="flex flex-col gap-4">
                <Specimen label="Selection">
                  <label className="flex items-center gap-3 text-small text-fg">
                    <Checkbox checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                    Use memory from earlier sessions
                  </label>
                  <div className="flex items-center justify-between gap-4">
                    <span id="sys-reminders" className="text-small text-fg">
                      Weekly practice reminders
                    </span>
                    <Switch checked={reminders} onCheckedChange={setReminders} aria-labelledby="sys-reminders" />
                  </div>
                  <Tabs
                    label="Report range"
                    variant="segmented"
                    defaultValue="30"
                    items={[
                      { value: "7", label: "7 days" },
                      { value: "30", label: "30 days" },
                      { value: "all", label: "All time" },
                    ]}
                  />
                </Specimen>

                <Specimen label="Status and overlays">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Draft</Badge>
                    <Badge tone="brand">New</Badge>
                    <Badge tone="memory">From memory</Badge>
                    <Badge tone="success">Improved</Badge>
                    <Badge tone="warning">Focus area</Badge>
                    <Badge tone="danger">Failed</Badge>
                    <Badge tone="info">Processing</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" onClick={() => setDialogOpen(true)}>
                      Open dialog
                    </Button>
                    <Tooltip content="Scores compare this session with your last three.">
                      <button
                        type="button"
                        aria-label="How scores work"
                        className="inline-flex size-10 items-center justify-center rounded-control text-fg-muted hover:bg-sunken hover:text-fg focus-ring"
                      >
                        <CircleHelp aria-hidden strokeWidth={1.75} className="size-[1.125rem]" />
                      </button>
                    </Tooltip>
                  </div>
                </Specimen>
              </div>

              <div className="md:col-span-2">
                <Alert tone="success" title="Report ready">
                  Your system design report is ready. Capacity estimation improved by 14 points.
                </Alert>
              </div>
            </div>
          </Block>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="End this interview?"
        description="You have answered 4 of 6 questions. Clutchly will build a report from what you have so far."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Keep going
            </Button>
            <Button onClick={() => setDialogOpen(false)}>
              End and get report
            </Button>
          </>
        }
      />
    </section>
  );
}
