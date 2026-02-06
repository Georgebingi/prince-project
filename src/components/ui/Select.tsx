<<<<<<< HEAD
import React, { useId } from 'react';
=======
import { useId } from 'react';
import type React from 'react';

>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
interface SelectOption {
  value: string;
  label: string;
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
<<<<<<< HEAD
=======
  placeholder?: string;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}
export function Select({
  label,
  options,
  error,
  className = '',
  id,
<<<<<<< HEAD
  ...props
}: SelectProps) {
  const selectId = id || useId();
  return (
    <div className="w-full">
      {label &&
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-slate-700 mb-1.5">

          {label}
        </label>
      }
      <div className="relative">
        <select
          id={selectId}
          className={`
=======
  placeholder = 'Select an option',
  value,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  return <div className="w-full">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>}
      <div className="relative">
        <select id={selectId} className={`
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
            flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50
            appearance-none
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
<<<<<<< HEAD
          `}
          {...props}>

          <option value="" disabled selected>
            Select an option
          </option>
          {options.map((option) =>
          <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20">

=======
          `} value={value} {...props}>
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map(option => <option key={option.value} value={option.value}>
              {option.label}
            </option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
<<<<<<< HEAD
    </div>);

=======
    </div>;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}