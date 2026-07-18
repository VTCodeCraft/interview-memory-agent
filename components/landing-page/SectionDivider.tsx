import React from 'react';

interface SectionDividerProps {
  className?: string;
}

export default function SectionDivider({ className = '' }: SectionDividerProps) {
  return <div className={`w-full h-20 md:h-32 bg-transparent ${className}`} />;
}
