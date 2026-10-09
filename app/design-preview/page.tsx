import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { directionById } from "./_components/directions";
import { PreviewApp } from "./_components/PreviewApp";
import { editorialSans, editorialSerif } from "./fonts";

export const metadata: Metadata = {
  title: "Design system preview | Clutchly",
  robots: { index: false, follow: false },
};

/**
 * /design-preview: design-system exploration tool, not a product feature.
 * Available in development; in production only when ENABLE_DESIGN_PREVIEW=true
 * (e.g. on a preview deployment). Contains sample data only. ?d=precision |
 * editorial | spatial selects the direction.
 */
export default async function DesignPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string | string[] }>;
}) {
  const enabled =
    process.env.NODE_ENV !== "production" || process.env.ENABLE_DESIGN_PREVIEW === "true";
  if (!enabled) notFound();

  const { d } = await searchParams;
  const initial = directionById(Array.isArray(d) ? d[0] : d).id;

  return (
    <div className={`${editorialSerif.variable} ${editorialSans.variable} flex-1`}>
      <PreviewApp initial={initial} />
    </div>
  );
}
