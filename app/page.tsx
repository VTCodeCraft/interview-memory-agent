import { getAppUser } from "@/lib/auth/app-user";
import { getLimits } from "@/lib/config/limits";

import Navbar from "@/components/landing-page/Navbar";
import HeroSection from "@/components/landing-page/HeroSection";
import CoreFeaturesSection from "@/components/landing-page/CoreFeaturesSection";
import HowItWorksSection from "@/components/landing-page/HowItWorksSection";
import ReportsSection from "@/components/landing-page/ReportsSection";
import PricingSection from "@/components/landing-page/PricingSection";
import FaqSection from "@/components/landing-page/FaqSection";
import FinalCtaSection from "@/components/landing-page/FinalCtaSection";
import Footer from "@/components/landing-page/Footer";

/**
 * Public landing page, built with the Precision design system (ds-* utilities
 * and tokens in app/globals.css, docs/DESIGN_SYSTEM.md).
 *
 * Sections without real evidence are intentionally absent: social proof,
 * testimonials and an interactive demo.
 */
export default async function Home() {
  // Same onboarding-completion rule the (app) layout enforces.
  const appUser = await getAppUser();
  const auth = {
    clerkId: appUser?.clerkId ?? null,
    setupDone: appUser?.user?.onboardingComplete ?? false,
  };
  const { MAX_INTERVIEWS: limit, WINDOW: period } = getLimits();

  return (
    <div className="ds-page flex min-h-dvh flex-1 flex-col pb-8">
      <Navbar {...auth} />
      <main className="flex-1">
        <HeroSection {...auth} limit={limit} period={period} />
        <CoreFeaturesSection />
        <HowItWorksSection {...auth} />
        <ReportsSection />
        <PricingSection {...auth} limit={limit} period={period} />
        <FaqSection limit={limit} period={period} />
        <FinalCtaSection {...auth} />
      </main>
      <Footer />
    </div>
  );
}
