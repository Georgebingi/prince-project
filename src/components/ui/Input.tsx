import React, { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export function Input({
  label,
  error,
  icon,
  className = '',
  id,
  type = 'text',
  ...props
}: InputProps) {
  const inputId = id || useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? showPassword ? 'text' : 'password' : type;
  return <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>}
        <input id={inputId} type={inputType} className={`
            flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `} {...props} />

        {isPassword && <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none" tabIndex={-1}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>;
}