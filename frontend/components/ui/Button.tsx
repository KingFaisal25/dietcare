import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, loading, icon, disabled, children, ...props }, ref) => {
    const isLoaderVisible = isLoading || loading;
    const baseStyles = 'relative inline-flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 disabled:opacity-50 disabled:pointer-events-none active:scale-95 overflow-hidden';
    
    const variants = {
      primary: 'bg-green-600 text-white shadow-xl shadow-green-900/20 hover:bg-green-700 hover:shadow-green-900/30 border-none',
      secondary: 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-black border-none',
      outline: 'bg-white border-2 border-slate-100 text-slate-900 hover:border-green-500 hover:text-green-600 shadow-sm',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900',
      danger: 'bg-red-500 text-white shadow-xl shadow-red-900/20 hover:bg-red-600 border-none',
      white: 'bg-white text-green-600 shadow-2xl shadow-green-900/10 hover:bg-green-50 border-none',
    };

    const sizes = {
      xs: 'h-9 px-4 text-[10px]',
      sm: 'h-11 px-6 text-[11px]',
      md: 'h-14 px-8 text-xs',
      lg: 'h-16 px-10 text-sm',
      xl: 'h-20 px-12 text-base',
    };

    const isDisabled = disabled || isLoaderVisible;

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoaderVisible && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <svg 
              className="animate-spin h-5 w-5 text-current" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        <span className={`flex items-center gap-2 transition-opacity duration-300 ${isLoaderVisible ? 'opacity-0' : 'opacity-100'}`}>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
