import React from 'react';

interface SectionDividerProps {
  className?: string;
}

export default function SectionDivider({ className = '' }: SectionDividerProps) {
  return <div className={`w-full h-10 md:h-16 bg-transparent ${className}`} />;
}
