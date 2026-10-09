import AuthCta, { type AuthState } from "./AuthCta";

export default function FinalCtaSection(auth: AuthState) {
  return (
    <section aria-labelledby="final-cta-title" className="ds-container pt-(--spacing-section)">
      <div className="rounded-bezel bg-inverse px-6 py-12 text-fg-inverse shadow-raised [--color-focus:var(--color-fg-inverse)] sm:px-12 sm:py-16 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h2 id="final-cta-title" className="ds-display text-balance text-headline text-fg-inverse">
              Walk into your next interview prepared.
            </h2>
            <p className="mt-4 max-w-[38rem] text-lead text-fg-inverse/75">
              Practice out loud, see what to work on, and let each session build on the last.
            </p>
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <AuthCta
              {...auth}
              className="w-full bg-fg-inverse text-inverse shadow-none hover:bg-fg-inverse/90 active:bg-fg-inverse/80 sm:w-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
