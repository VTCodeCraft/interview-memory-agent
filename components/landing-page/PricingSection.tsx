'use client';

import React from 'react';
import Link from 'next/link';
import { SignUpButton } from "@clerk/nextjs";
import { ROUTES } from "@/lib/utils/constants";
import SectionHeading from './SectionHeading';

interface PricingSectionProps {
  clerkId: string | null;
  setupDone: boolean;
}

export default function PricingSection({ clerkId, setupDone }: PricingSectionProps) {
  return (
    <section id="pricing" className="relative py-0 overflow-hidden text-on-surface">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-5%] right-[5%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 dotted-pattern"></div>
      </div>
      
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
        <SectionHeading
          badge={
            <>
              <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
              <span className="font-label-md text-primary tracking-wide">Simple Pricing</span>
            </>
          }
          title="Practice smarter. Pay only when you're ready."
          subtitle="Start for free to explore the basics. Upgrade to Pro for unlimited AI-powered interview prep that learns from you."
        />

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md items-end mb-xl">
          {/* Plan 1: Free */}
          <div className="bg-surface-container-lowest p-xl rounded-2xl border border-outline-variant/30 premium-shadow h-fit transition-transform hover:scale-[1.02] duration-300">
            <div className="mb-lg">
              <span className="font-label-md text-label-md text-primary uppercase tracking-wider">Free</span>
              <div className="flex items-baseline gap-xs mt-xs">
                <span className="font-headline-md text-headline-md">₹0</span>
                <span className="font-body-md text-body-md text-on-surface-variant">/month</span>
              </div>
            </div>
            
            <ul className="space-y-sm mb-lg">
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                3 AI Interviews
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Voice Interviews
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Resume Upload
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Job Description Upload
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Basic Performance Report
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Community Support
              </li>
            </ul>
            
            {!clerkId ? (
              <SignUpButton mode="modal">
                <button className="w-full py-4 rounded-xl border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer">
                  Start Free
                </button>
              </SignUpButton>
            ) : (
              <Link href={setupDone ? ROUTES.interview : ROUTES.onboarding}>
                <button className="w-full py-4 rounded-xl border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer">
                  Start Free
                </button>
              </Link>
            )}
          </div>

          {/* Plan 2: Pro (Featured) */}
          <div className="relative bg-surface-container-lowest p-xl rounded-2xl border-2 border-primary pro-glow h-fit scale-105 z-20 transition-transform hover:scale-[1.07] duration-300">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-on-primary rounded-full font-label-sm text-label-sm whitespace-nowrap">
              Most Popular
            </div>
            
            <div className="mb-lg">
              <span className="font-label-md text-label-md text-primary uppercase tracking-wider">Pro</span>
              <div className="flex items-baseline gap-xs mt-xs">
                <span className="font-headline-md text-headline-md">₹999</span>
                <span className="font-body-md text-body-md text-on-surface-variant">/month</span>
              </div>
            </div>
            
            <ul className="space-y-sm mb-lg">
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined icon-fill text-primary text-[20px]">check_circle</span>
                Unlimited AI Interviews
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined icon-fill text-primary text-[20px]">check_circle</span>
                Long-Term AI Memory
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined icon-fill text-primary text-[20px]">check_circle</span>
                Adaptive Questions
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined icon-fill text-primary text-[20px]">check_circle</span>
                Advanced Reports
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined icon-fill text-primary text-[20px]">check_circle</span>
                AI Coaching
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined icon-fill text-primary text-[20px]">check_circle</span>
                Progress Timeline
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined icon-fill text-primary text-[20px]">check_circle</span>
                Readiness Score
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined icon-fill text-primary text-[20px]">check_circle</span>
                Company-Specific Interviews
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined icon-fill text-primary text-[20px]">check_circle</span>
                Priority Support
              </li>
            </ul>
            
            {!clerkId ? (
              <SignUpButton mode="modal">
                <button className="w-full py-5 rounded-xl bg-gradient-to-br from-primary to-secondary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-xs cursor-pointer">
                  Start 7-Day Free Trial
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </SignUpButton>
            ) : (
              <Link href={setupDone ? ROUTES.interview : ROUTES.onboarding}>
                <button className="w-full py-5 rounded-xl bg-gradient-to-br from-primary to-secondary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-xs cursor-pointer">
                  Start 7-Day Free Trial
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </Link>
            )}
          </div>

          {/* Plan 3: Teams */}
          <div className="bg-surface-container-lowest p-xl rounded-2xl border border-outline-variant/30 premium-shadow h-fit transition-transform hover:scale-[1.02] duration-300">
            <div className="mb-lg">
              <span className="font-label-md text-label-md text-primary uppercase tracking-wider">Teams</span>
              <div className="flex items-baseline gap-xs mt-xs">
                <span className="font-headline-md text-headline-md">Custom</span>
              </div>
            </div>
            
            <ul className="space-y-sm mb-lg">
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Everything in Pro
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Team Dashboard
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Student Analytics
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Bulk Licenses
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Admin Controls
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Shared Reports
              </li>
              <li className="flex items-start gap-sm font-body-md text-body-md">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Dedicated Support
              </li>
            </ul>
            
            <button className="w-full py-4 rounded-xl bg-inverse-surface text-inverse-on-surface font-label-md text-label-md hover:opacity-90 transition-opacity">
              Contact Sales
            </button>
          </div>
        </div>

        {/* Feature Comparison Table (Mobile hidden) */}
        <div className="hidden md:block mb-xl overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest premium-shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="p-md font-label-md text-label-md">Features</th>
                <th className="p-md font-label-md text-label-md">Free</th>
                <th className="p-md font-label-md text-label-md text-primary">Pro</th>
                <th className="p-md font-label-md text-label-md">Teams</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md text-body-md">
              <tr>
                <td className="p-md text-on-surface-variant">Interview Limit</td>
                <td className="p-md">3/month</td>
                <td className="p-md text-primary font-semibold">Unlimited</td>
                <td className="p-md">Unlimited</td>
              </tr>
              <tr>
                <td className="p-md text-on-surface-variant">AI Intelligence</td>
                <td className="p-md">Standard</td>
                <td className="p-md text-primary font-semibold">Adaptive + Memory</td>
                <td className="p-md">Adaptive + Memory</td>
              </tr>
              <tr>
                <td className="p-md text-on-surface-variant">Collaboration</td>
                <td className="p-md">—</td>
                <td className="p-md text-primary font-semibold">—</td>
                <td className="p-md">Team Dashboard</td>
              </tr>
              <tr>
                <td className="p-md text-on-surface-variant">Support</td>
                <td className="p-md">Community</td>
                <td className="p-md text-primary font-semibold">Priority</td>
                <td className="p-md">Dedicated Manager</td>
              </tr>
            </tbody>
          </table>
        </div>




      </div>
    </section>
  );
}
