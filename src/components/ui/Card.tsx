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
<<<<<<< HEAD
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}
      {...props}>

      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>);

=======
  return <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`} {...props}>
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}