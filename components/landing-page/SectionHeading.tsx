import React from 'react';

interface SectionHeadingProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

export default function SectionHeading({
  badge,
  title,
  subtitle,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={`text-center mb-xl max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop relative z-10 ${className}`}>
      {badge && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-md text-label-md mb-md">
          {badge}
        </div>
      )}
      <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-md tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
