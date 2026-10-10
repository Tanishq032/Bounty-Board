import React from 'react';
import DemoBanner from '../../components/demo/DemoBanner';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col w-full">
      <DemoBanner />
      {children}
    </div>
  );
}
