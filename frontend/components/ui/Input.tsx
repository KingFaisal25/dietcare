import React, { ReactNode } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, suffix, id, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = error ? `${inputId}-error` : undefined;
    const hasValue = value !== undefined && value !== '';

    return (
      <div className="w-full">
        <div className="relative group">
          {/* Floating Label */}
          {label && (
            <label 
              htmlFor={inputId}
              className={`absolute left-3 transition-all duration-base pointer-events-none z-10
                ${(isFocused || hasValue) 
                  ? '-top-2.5 text-xs px-1 text-brand-600 font-bold bg-[var(--background)] dark:bg-[var(--background)]' 
                  : 'top-3 text-sm text-neutral-400'
                }
                ${error ? 'text-danger' : ''}
              `}
            >
              {label}
            </label>
          )}

          <div className="relative flex items-center">
            {/* Prefix */}
            {icon && (
              <div className="absolute left-3 flex items-center pointer-events-none text-neutral-400">
                {icon}
              </div>
            )}

            <input
              id={inputId}
              ref={ref}
              value={value}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              aria-invalid={!!error}
              aria-describedby={errorId}
              className={`flex h-12 w-full rounded-[18px] border bg-[var(--background-elevated)] px-3 py-2 text-sm text-[var(--foreground)] transition-all duration-base
                file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 
                focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50
                ${icon ? 'pl-10' : ''}
                ${suffix ? 'pr-12' : ''}
                ${error 
                  ? 'border-danger ring-2 ring-danger/10' 
                  : 'border-[color:var(--border-color)] focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-500/20'
                }
                ${className}
              `}
              {...props}
            />

            {/* Suffix */}
            {suffix && (
              <div className="absolute right-3 flex items-center pointer-events-none text-neutral-400 text-xs font-bold uppercase tracking-wider">
                {suffix}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-danger font-bold flex items-center gap-1" role="alert">
            <span className="w-1 h-1 rounded-full bg-danger"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
