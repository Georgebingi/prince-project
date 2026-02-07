import React from 'react';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}
export function Card({
  children,
  className = '',
  noPadding = false,
  ...props
}: CardProps) {
  return <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`} {...props}>
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>;
}