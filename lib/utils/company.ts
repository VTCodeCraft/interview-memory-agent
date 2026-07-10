/**
 * Company-name resolution + placeholder sanitization (Issue #5).
 *
 * Gemini occasionally emits the literal token "[Company Name]" / "COMPANY_NAME"
 * instead of the real company. We (a) always inject the real company into the
 * prompts so the model has no reason to use a placeholder, and (b) run a
 * defensive sanitizer over generated/returned text so any stray placeholder is
 * replaced with the real name (or a neutral "our company" fallback) before it
 * ever reaches the candidate.
 */

export interface CompanySource {
  company?: string | null;
  customCompanyName?: string | null;
}

/**
 * Resolve the human-readable company name for prompts/sanitization.
 * "Other" uses the free-text custom name; otherwise the selected company.
 * Returns null when no company is known (caller should use neutral phrasing).
 */
export function resolveCompanyName(source: CompanySource): string | null {
  const raw =
    source.company === "Other"
      ? source.customCompanyName?.trim() || null
      : source.company?.trim() || null;
  return raw || null;
}

/** Matches "[Company Name]", "Company Name", "[COMPANY_NAME]", "COMPANY_NAME", "COMPANY NAME". */
const PLACEHOLDER_RE = /\[?\[?\s*COMPANY[\s_]?NAME\s*\]?\]?/gi;

/**
 * Replace any company placeholder token with the real company name.
 * When no company is known, placeholders become the neutral "our company".
 */
export function replaceCompanyPlaceholder(
  text: string,
  company: string | null,
): string {
  if (!text) return text;
  const replacement = company && company.length > 0 ? company : "our company";
  return text.replace(PLACEHOLDER_RE, replacement);
}
