"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { FileText, RefreshCw, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { MAX_FILE_SIZE } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import type { SavedResume } from "./options";

const RESUME_ENDPOINT = "/api/user/resume";
const MAX_MB = Math.round(MAX_FILE_SIZE / (1024 * 1024));

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; fileName: string; percent: number }
  | { phase: "reading"; fileName: string };

/** Same checks the server runs (services/resume.service.ts), so most mistakes never leave the browser. */
function checkFile(file: File): string | null {
  if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
    return "Only PDF files are accepted.";
  }
  if (file.size === 0) return "This file is empty. Choose another PDF.";
  if (file.size > MAX_FILE_SIZE) return `This PDF is larger than ${MAX_MB} MB. Choose a smaller file.`;
  return null;
}

function readError(status: number, body: unknown): string {
  const payload = (body ?? {}) as { error?: unknown; message?: unknown };
  const serverMessage = typeof payload.error === "string" ? payload.error : typeof payload.message === "string" ? payload.message : null;
  if (status === 401) return "Your session has ended. Sign in again, then retry the upload.";
  if (status === 413) return "The file is too large for the server to accept. Try a smaller PDF.";
  if (status === 429) return "Too many attempts. Wait a minute, then try again.";
  if (serverMessage) return serverMessage.endsWith(".") ? serverMessage : `${serverMessage}.`;
  return "We couldn't upload your resume. Check your connection and try again.";
}

const DATE_FORMAT = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });

/** "Oct 2, 2026" with only the digits in the data face. */
function DateText({ iso }: { iso: string }) {
  return (
    // Server and browser time zones can differ by a day.
    <time dateTime={iso} suppressHydrationWarning>
      {DATE_FORMAT.formatToParts(new Date(iso)).map((part, index) =>
        part.type === "day" || part.type === "year" ? (
          <span key={index} className="font-data tabular-nums">
            {part.value}
          </span>
        ) : (
          part.value
        ),
      )}
    </time>
  );
}

/**
 * Resume picker that uploads as soon as a file is chosen, with real upload
 * progress and the server's own error messages. The backend keeps one resume
 * per user: it extracts the text, stores it with the file's metadata (not the
 * PDF itself) and replaces the previous resume only after the new one parsed.
 */
export function ResumeUpload({
  saved,
  onUploaded,
  onBusyChange,
  missingError,
  describedById,
}: {
  saved: SavedResume | null;
  onUploaded: (resume: SavedResume) => void;
  onBusyChange: (busy: boolean) => void;
  /** Shown when the user tries to finish without a resume. */
  missingError?: string;
  /** Id of the explanatory text above the control. */
  describedById: string;
}) {
  const errorId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [state, setState] = useState<UploadState>({ phase: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const busy = state.phase !== "idle";
  const shownError = error ?? (saved ? undefined : missingError);

  // Report busy in the same update as the phase change (not from an effect a
  // render later), so the form's buttons never flash disabled after an upload.
  function setPhase(next: UploadState) {
    setState(next);
    onBusyChange(next.phase !== "idle");
  }

  useEffect(() => () => xhrRef.current?.abort(), []);

  function upload(file: File) {
    const problem = checkFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setPhase({ phase: "uploading", fileName: file.name, percent: 0 });

    const form = new FormData();
    form.append("file", file);
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", RESUME_ENDPOINT);
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
      setState({ phase: "uploading", fileName: file.name, percent });
    };
    // Bytes are on the server; it now extracts the text before replying.
    xhr.upload.onload = () => setState({ phase: "reading", fileName: file.name });

    xhr.onload = () => {
      xhrRef.current = null;
      setPhase({ phase: "idle" });
      const body = xhr.response as { success?: boolean; originalFileName?: string; pages?: number } | null;
      if (xhr.status >= 200 && xhr.status < 300 && body?.success) {
        onUploaded({
          fileName: body.originalFileName ?? file.name,
          pages: typeof body.pages === "number" ? body.pages : 0,
          uploadedAt: new Date().toISOString(),
        });
        return;
      }
      setError(readError(xhr.status, body));
    };
    xhr.onerror = () => {
      xhrRef.current = null;
      setPhase({ phase: "idle" });
      setError("We couldn't reach the server. Check your connection and try again.");
    };
    xhr.onabort = () => {
      xhrRef.current = null;
      setPhase({ phase: "idle" });
    };

    xhr.send(form);
  }

  function onPick(files: FileList | null) {
    const file = files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (file) upload(file);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!busy) onPick(event.dataTransfer.files);
  }

  const describedBy = [describedById, statusId, shownError ? errorId : null].filter(Boolean).join(" ");
  const choose = () => inputRef.current?.click();

  return (
    <div className="flex flex-col gap-3">
      {/* Opened by the visible buttons, which carry the label and description. */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        tabIndex={-1}
        aria-hidden
        className="hidden"
        onChange={(event) => onPick(event.target.files)}
      />

      {busy ? (
        <div className="rounded-card border border-line bg-panel p-4 sm:p-5" aria-live="polite">
          <div className="flex items-start gap-3">
            <FileIcon />
            <div className="min-w-0 flex-1">
              <p title={state.fileName} className="line-clamp-2 text-small font-semibold [overflow-wrap:anywhere] text-fg">
                {state.fileName}
              </p>
              <p id={statusId} className="mt-0.5 text-small text-fg-muted">
                {state.phase === "uploading" ? (
                  <>
                    Uploading <span className="font-data tabular-nums">{state.percent}%</span>
                  </>
                ) : (
                  "Reading your resume. This can take a few seconds."
                )}
              </p>
            </div>
            {state.phase === "uploading" && (
              <Button variant="ghost" size="sm" onClick={() => xhrRef.current?.abort()}>
                Cancel
              </Button>
            )}
          </div>
          <div
            role="progressbar"
            aria-label={state.phase === "uploading" ? "Upload progress" : "Reading resume"}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={state.phase === "uploading" ? state.percent : undefined}
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-sunken"
          >
            {state.phase === "uploading" ? (
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-(--duration-base) ease-standard"
                style={{ width: `${state.percent}%` }}
              />
            ) : (
              <div className="h-full w-full rounded-full bg-brand/60 motion-safe:animate-pulse" />
            )}
          </div>
        </div>
      ) : saved ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "rounded-card border bg-panel p-4 transition-[border-color,background-color] duration-(--duration-fast) ease-standard sm:p-5",
            dragging ? "border-brand bg-brand-soft" : "border-line",
          )}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
            <FileIcon />
            <div className="min-w-0 flex-1 basis-48">
              <p title={saved.fileName} className="line-clamp-2 text-small font-semibold [overflow-wrap:anywhere] text-fg">
                {saved.fileName}
              </p>
              <div id={statusId} className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-fg-muted">
                <Badge tone="success">On file</Badge>
                <span>
                  {saved.pages > 0 && (
                    <>
                      <span className="font-data tabular-nums">{saved.pages}</span> {saved.pages === 1 ? "page" : "pages"}
                      {" · "}
                    </>
                  )}
                  {saved.uploadedAt ? (
                    <>
                      Saved <DateText iso={saved.uploadedAt} />
                    </>
                  ) : (
                    "Saved"
                  )}
                </span>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={choose} aria-describedby={describedBy} className="max-sm:w-full">
              <RefreshCw aria-hidden strokeWidth={1.75} />
              Replace PDF
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center rounded-card border border-dashed px-5 py-9 text-center transition-[border-color,background-color] duration-(--duration-fast) ease-standard",
            dragging ? "border-brand bg-brand-soft" : shownError ? "border-danger bg-canvas" : "border-line-control bg-canvas",
          )}
        >
          <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand ring-1 ring-memory-line ring-inset">
            <Upload strokeWidth={1.75} className="size-5" />
          </span>
          <p className="mt-4 hidden text-small font-semibold text-fg sm:block">Drag your resume here</p>
          <p id={statusId} className="mt-1 text-small text-fg-muted">
            PDF only, up to <span className="font-data tabular-nums">{MAX_MB}</span> MB
          </p>
          <Button
            variant="secondary"
            onClick={choose}
            aria-describedby={describedBy}
            className="mt-4"
          >
            Choose a PDF
          </Button>
        </div>
      )}

      {shownError && (
        <FieldError id={errorId} role="alert">
          {shownError}
        </FieldError>
      )}
    </div>
  );
}

function FileIcon() {
  return (
    <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line bg-canvas text-fg-muted">
      <FileText strokeWidth={1.75} className="size-5" />
    </span>
  );
}
