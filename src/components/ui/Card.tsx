import React from 'react';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
  glass?: boolean;
}
export function Card({
  children,
  className = '',
  noPadding = false,
  glass = false,
  ...props
}: CardProps) {
  const glassClasses = glass ? 'backdrop-blur-md bg-white/10 border-white/20 shadow-lg shadow-black/10' : 'bg-white border-slate-200 shadow-sm';
  return <div className={`rounded-lg border ${glassClasses} ${className}`} {...props}>
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>;
}
