"use client";

import { useCallback, useRef, useState } from "react";

import { directionById, directionStyle, type DirectionId } from "./directions";
import { DirectionDrawer } from "./DirectionDrawer";
import { PreviewToolbar } from "./PreviewToolbar";
import { SystemSheet } from "./SystemSheet";
import { Capabilities } from "./site/Capabilities";
import { ClosingCta, SiteFooter } from "./site/Closing";
import { Hero } from "./site/Hero";
import { ReportShowcase } from "./site/ReportShowcase";
import { SiteNav } from "./site/SiteNav";

/**
 * One realistic Clutchly page rendered in the selected direction. Content and
 * layout never change between directions; only tokens do (applied as CSS
 * variables on the wrapper). The direction is kept in ?d= for sharing.
 */
export function PreviewApp({ initial }: { initial: DirectionId }) {
  const [id, setId] = useState<DirectionId>(initial);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const direction = directionById(id);

  const select = useCallback((next: DirectionId) => {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set("d", next);
    window.history.replaceState(window.history.state, "", url);
  }, []);

  return (
    <>
      <div
        ref={scopeRef}
        data-direction={id}
        style={directionStyle(direction)}
        className="ds-page min-h-dvh pb-32"
      >
        <div key={id} className="motion-safe:animate-fade-in">
          <SiteNav />
          <main>
            <Hero />
            <Capabilities />
            <ReportShowcase />
            <ClosingCta />
          </main>
          <SiteFooter />
          <SystemSheet direction={direction} scopeRef={scopeRef} />
        </div>
        <DirectionDrawer open={detailsOpen} onOpenChange={setDetailsOpen} direction={direction} onSelect={select} />
      </div>
      <PreviewToolbar value={id} onChange={select} onOpenDetails={() => setDetailsOpen(true)} />
    </>
  );
}
