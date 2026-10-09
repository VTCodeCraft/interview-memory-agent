'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, Show } from "@clerk/nextjs";
import { POST_AUTH_REDIRECT, ROUTES } from "@/lib/utils/constants";
import AccountMenu from "@/components/common/AccountMenu";

export default function Header() {
  return (
    <div className="w-full flex justify-center pt-3 z-50 bg-background sticky top-0 pb-1 bg-background/80 backdrop-blur-md">
      <nav className="w-[88%] max-w-7xl h-[56px] flex items-center justify-between px-6 bg-white/80 backdrop-blur-md rounded-[18px] shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-outline-variant/20">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Clutchly" width={32} height={32} className="w-8 h-8 object-contain" priority />
            <span className="font-bold text-base text-on-surface">Clutchly</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/#features" 
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors font-semibold"
          >
            Features
          </Link>
          <Link 
            href="/#how-it-works" 
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors font-semibold"
          >
            How it Works
          </Link>
          {/* <Link
            href="/#pricing"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors font-semibold"
          >
            Pricing
          </Link> */}
          <Link
            href="/#faq"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors font-semibold"
          >
            FAQ
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton
              mode="modal"
              forceRedirectUrl={POST_AUTH_REDIRECT}
              signUpForceRedirectUrl={POST_AUTH_REDIRECT}
            >
              <button className="font-label-sm text-label-sm px-4 py-1.5 text-on-surface hover:text-primary transition-colors cursor-pointer font-bold">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton
              mode="modal"
              forceRedirectUrl={POST_AUTH_REDIRECT}
              signInForceRedirectUrl={POST_AUTH_REDIRECT}
            >
              <button className="font-label-sm text-label-sm bg-primary text-white px-4 py-2 rounded-full hover:bg-[#4338CA] transition-colors cursor-pointer shadow-sm font-bold">
                Get Started
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link 
              href={ROUTES.interviews}
              className="font-label-sm text-label-sm bg-primary text-white px-4 py-2 rounded-full hover:bg-[#4338CA] transition-colors cursor-pointer shadow-sm font-bold"
            >
              Dashboard
            </Link>
            <AccountMenu />
          </Show>
        </div>
      </nav>
    </div>
  );
}