import React, { ReactNode } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, loading, icon, disabled, children, ...props }, ref) => {
    const isLoaderVisible = isLoading || loading;
    const baseStyles = 'theme-transition inline-flex items-center justify-center gap-2 rounded-pill font-semibold tracking-[-0.01em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] hover:-translate-y-[1px]';
    
    const variants = {
      primary: 'border border-transparent bg-brand-500 text-white shadow-green hover:bg-brand-600',
      secondary: 'border border-neutral-200 bg-white/90 text-neutral-800 shadow-card hover:border-brand-200 hover:bg-brand-50 dark:border-white/10 dark:bg-neutral-900/80 dark:text-neutral-50 dark:hover:bg-neutral-800',
      outline: 'border border-brand-200 bg-transparent text-brand-700 hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-300 dark:hover:bg-brand-500/10',
      ghost: 'border border-transparent bg-transparent text-neutral-600 hover:bg-white/70 hover:text-brand-700 dark:text-neutral-300 dark:hover:bg-neutral-900/70 dark:hover:text-brand-300',
      danger: 'border border-transparent bg-danger text-white hover:bg-danger-dark shadow-card focus-visible:ring-danger',
    };

    const sizes = {
      xs: 'h-8 px-3 text-[11px]',
      sm: 'h-10 px-4 text-sm',
      md: 'h-11 px-5 text-sm',
      lg: 'h-12 px-6 text-base',
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
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoaderVisible && icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
