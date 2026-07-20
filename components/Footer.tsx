'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  APP_NAME,
  ROUTES,
  CONTACT_FORM_URL,
  FEEDBACK_FORM_URL,
  BUG_REPORT_FORM_URL,
} from "@/lib/utils/constants";

const productLinks = [
  { label: "Dashboard", href: ROUTES.dashboard },
  { label: "New Interview", href: ROUTES.interview },
  { label: "Reports", href: ROUTES.reports },
  { label: "AI Memory", href: ROUTES.memory },
  { label: "Settings", href: ROUTES.settings },
];

const supportLinks = [
  { label: "FAQ", href: ROUTES.faq },
  { label: "Contact", href: CONTACT_FORM_URL, external: true },
  { label: "Feedback", href: FEEDBACK_FORM_URL, external: true },
  { label: "Report a Bug", href: BUG_REPORT_FORM_URL, external: true },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

interface FooterProps {
  variant?: "default" | "minimal";
}

export default function Footer({ variant = "default" }: FooterProps) {
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);

  const socialLinks = [
    { id: 1, icon: 'brand_awareness', href: '#' },
    { id: 2, icon: 'link', href: '#' },
    { id: 3, icon: 'terminal', href: '#' },
    { id: 4, icon: 'forum', href: '#' },
  ];

  if (variant === "minimal") {
    return (
      <footer className="w-full bg-surface border-t border-outline-variant/30 py-8">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-gutter flex flex-col md:flex-row justify-between items-center gap-sm">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            © 2026 Clutchly. All rights reserved.
          </p>
          <div className="flex gap-md">
            {legalLinks.map((link) => (
              <Link 
                key={link.label}
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" 
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <>
      {/* Top Divider Line */}
      <div className="w-full border-t border-outline-variant/30"></div>
      
      <footer className="w-full bg-surface py-xl">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-gutter">
          {/* Main Content: Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl lg:gap-gutter mb-xl">
            {/* Left: Branding & Bio */}
            <div className="lg:col-span-5 flex flex-col gap-sm">
              <div className="flex items-center gap-xs">
                <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[20px]">auto_awesome</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">{APP_NAME}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm leading-relaxed">
                Clutchly is your AI interview coach that remembers every interview, adapts to your progress, and helps you become interview-ready through personalized voice practice.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-sm mt-md">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    className="w-10 h-10 border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all"
                    href={link.href}
                    onMouseEnter={() => setHoveredIcon(link.id)}
                    onMouseLeave={() => setHoveredIcon(null)}
                  >
                    <span 
                      className={`material-symbols-outlined text-[18px] transition-all duration-300 ${hoveredIcon === link.id ? 'icon-fill' : ''}`}
                    >
                      {link.icon}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Right: Nav Columns */}
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-gutter lg:gap-md">
              {/* PRODUCT */}
              <div className="flex flex-col gap-md">
                <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Product</h4>
                <ul className="flex flex-col gap-sm">
                  {productLinks.map((link) => (
                    <li key={link.label}>
                      <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* SUPPORT */}
              <div className="flex flex-col gap-md">
                <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Support</h4>
                <ul className="flex flex-col gap-sm">
                  {supportLinks.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a 
                          className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" 
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href={link.href}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              {/* LEGAL */}
              <div className="flex flex-col gap-md">
                <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Legal</h4>
                <ul className="flex flex-col gap-sm">
                  {legalLinks.map((link) => (
                    <li key={link.label}>
                      <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Bottom Bar */}
          <div className="pt-lg border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-sm">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              © 2026 Clutchly. All rights reserved.
            </p>
            <div className="flex items-center gap-xs">
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Built with <span className="text-error">❤️</span> love by Samarth Chawla, Vishesh Tripathi &amp; Utsav Gupta
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
