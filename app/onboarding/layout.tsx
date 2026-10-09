import Footer from "@/components/Footer";

// Completion check + redirect live in page.tsx, which can read `?next=`.
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {children}
      <Footer variant="minimal" />
    </div>
  );
}
