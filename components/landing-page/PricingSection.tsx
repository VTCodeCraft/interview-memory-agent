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
          className="mt-12 md:mt-20"
          title="Predictable Pricing for Scalable Teams"
          subtitle="Start free, upgrade as you grow. No hidden bandwidth fees."
        />

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto mb-16 px-4">
          {/* Plan 1: Hobby */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300">
            <div>
              <h3 className="text-xl font-bold text-[#0B0B0F] mb-2">Hobby</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-[#0B0B0F]">$0</span>
                <span className="text-sm text-gray-500 font-medium">/month</span>
              </div>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Perfect for personal projects and small prototypes.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#34A853] text-[20px] font-bold">check_circle</span>
                  5 Projects
                </li>
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#34A853] text-[20px] font-bold">check_circle</span>
                  10GB Bandwidth
                </li>
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#34A853] text-[20px] font-bold">check_circle</span>
                  Basic Monitoring
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                  <span className="material-symbols-outlined text-gray-300 text-[20px] font-bold">cancel</span>
                  Custom Domains
                </li>
              </ul>
            </div>
            
            {!clerkId ? (
              <SignUpButton mode="modal">
                <button className="w-full py-3 rounded-full border border-[#E5E7EB] text-[#0B0B0F] font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer">
                  Start for Free
                </button>
              </SignUpButton>
            ) : (
              <Link href={setupDone ? ROUTES.interview : ROUTES.onboarding}>
                <button className="w-full py-3 rounded-full border border-[#E5E7EB] text-[#0B0B0F] font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer">
                  Start for Free
                </button>
              </Link>
            )}
          </div>

          {/* Plan 2: Pro (Featured) */}
          <div className="relative bg-white p-8 rounded-3xl border-2 border-[#635BFF] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#635BFF] text-white rounded-full text-[10px] font-bold tracking-wider uppercase">
              Most Popular
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#0B0B0F] mb-2 mt-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-[#0B0B0F]">$49</span>
                <span className="text-sm text-gray-500 font-medium">/month</span>
              </div>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Scale your startup with advanced features and team tools.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#635BFF] text-[20px] font-bold">check_circle</span>
                  Unlimited Projects
                </li>
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#635BFF] text-[20px] font-bold">check_circle</span>
                  500GB Bandwidth
                </li>
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#635BFF] text-[20px] font-bold">check_circle</span>
                  Advanced Monitoring
                </li>
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#635BFF] text-[20px] font-bold">check_circle</span>
                  Team Collaboration
                </li>
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#635BFF] text-[20px] font-bold">check_circle</span>
                  Custom Domains
                </li>
              </ul>
            </div>
            
            {!clerkId ? (
              <SignUpButton mode="modal">
                <button className="w-full py-3 rounded-full bg-[#635BFF] text-white font-semibold text-sm hover:bg-[#5249F3] transition-colors cursor-pointer">
                  Get Pro Started
                </button>
              </SignUpButton>
            ) : (
              <Link href={setupDone ? ROUTES.interview : ROUTES.onboarding}>
                <button className="w-full py-3 rounded-full bg-[#635BFF] text-white font-semibold text-sm hover:bg-[#5249F3] transition-colors cursor-pointer">
                  Get Pro Started
                </button>
              </Link>
            )}
          </div>

          {/* Plan 3: Enterprise */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300">
            <div>
              <h3 className="text-xl font-bold text-[#0B0B0F] mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-[#0B0B0F]">Custom</span>
              </div>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Tailored solutions for large organizations with specific needs.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#34A853] text-[20px] font-bold">check_circle</span>
                  Unlimited Everything
                </li>
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#34A853] text-[20px] font-bold">check_circle</span>
                  Dedicated Support
                </li>
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#34A853] text-[20px] font-bold">check_circle</span>
                  99.99% Uptime SLA
                </li>
                <li className="flex items-center gap-3 text-sm text-[#0B0B0F] font-medium">
                  <span className="material-symbols-outlined text-[#34A853] text-[20px] font-bold">check_circle</span>
                  SSO & Security Compliance
                </li>
              </ul>
            </div>
            
            <button className="w-full py-3 rounded-full border border-[#E5E7EB] text-[#0B0B0F] font-semibold text-sm hover:bg-gray-50 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
