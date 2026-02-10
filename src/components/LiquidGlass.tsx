import React from 'react';
import './LiquidGlass.css';

interface LiquidGlassProps {
  children: React.ReactNode;
}

export function LiquidGlass({ children }: LiquidGlassProps) {
  return (
    <div className="liquid-glass-container">
      <div className="liquid-glass-overlay">
        <div className="liquid-glass-content">
          {children}
        </div>
      </div>
    </div>
  );
}
