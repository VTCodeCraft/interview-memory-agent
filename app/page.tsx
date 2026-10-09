import { getAppUser } from "@/lib/auth/app-user";

import Navbar from "@/components/landing-page/Navbar";
import HeroSection from "@/components/landing-page/HeroSection";
import SocialProofSection from "@/components/landing-page/SocialProofSection";
import CoreFeaturesSection from "@/components/landing-page/CoreFeaturesSection";
import HowItWorksSection from "@/components/landing-page/HowItWorksSection";
// import PricingSection from "@/components/landing-page/PricingSection";
import FaqSection from "@/components/landing-page/FaqSection";
import Footer from "@/components/landing-page/Footer";
import SectionDivider from "@/components/landing-page/SectionDivider";

export default async function Home() {
  // Same onboarding-completion rule the (app) layout enforces.
  const appUser = await getAppUser();
  const clerkId = appUser?.clerkId ?? null;
  const setupDone = appUser?.user?.onboardingComplete ?? false;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center overflow-x-hidden font-sans relative">
      <Navbar clerkId={clerkId} setupDone={setupDone} />
      <HeroSection clerkId={clerkId} setupDone={setupDone} />
      {/* <SocialProofSection /> */}
      <SectionDivider />
      <CoreFeaturesSection />
      <SectionDivider />
      <HowItWorksSection clerkId={clerkId} setupDone={setupDone} />
      <SectionDivider />
      {/* <PricingSection clerkId={clerkId} setupDone={setupDone} />
      <SectionDivider /> */}
      <FaqSection />
      <SectionDivider />
      <Footer />
    </div>
  );
}
