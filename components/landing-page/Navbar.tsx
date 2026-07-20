'use client';

import React from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ROUTES } from "@/lib/utils/constants";

interface NavbarProps {
  clerkId: string | null;
  setupDone: boolean;
}

export default function Navbar({ clerkId, setupDone }: NavbarProps) {
  return (
    <nav className="fixed top-0 mt-3 z-50 w-[88%] max-w-7xl h-[56px] flex items-center justify-between px-6 bg-white/80 backdrop-blur-md rounded-[18px] shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-outline-variant/20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white !text-[18px]">bolt</span>
        </div>
        <span className="font-bold text-base text-on-surface">Clutchly</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <Link 
          href="#features" 
          className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors font-semibold"
        >
          Features
        </Link>
        <Link 
          href="#how-it-works" 
          className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors font-semibold"
        >
          How it Works
        </Link>
        <Link 
          href="#pricing" 
          className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors font-semibold"
        >
          Pricing
        </Link>
        <Link 
          href="#faq" 
          className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors font-semibold"
        >
          FAQ
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        {!clerkId ? (
          <>
            <SignInButton mode="modal">
              <button className="font-label-sm text-label-sm px-4 py-1.5 text-on-surface hover:text-primary transition-colors cursor-pointer font-bold">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="font-label-sm text-label-sm bg-primary text-white px-4 py-2 rounded-full hover:bg-[#4338CA] transition-colors cursor-pointer shadow-sm font-bold">
                Get Started
              </button>
            </SignUpButton>
          </>
        ) : (
          <>
            <Link 
              href={setupDone ? ROUTES.interview : ROUTES.onboarding}
              className="font-label-sm text-label-sm bg-primary text-white px-4 py-2 rounded-full hover:bg-[#4338CA] transition-colors cursor-pointer shadow-sm font-bold"
            >
              Dashboard
            </Link>
            <UserButton />
          </>
        )}
      </div>
    </nav>
  );
}
