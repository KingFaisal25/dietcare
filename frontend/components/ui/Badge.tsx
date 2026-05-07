import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'protein' | 'carbs' | 'fat' | 'meal' | 'outline';
  progress?: number;
}

export function Badge({ className = '', variant = 'default', progress, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300',
    success: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
    warning: 'bg-warning-light text-warning-dark dark:bg-warning/20 dark:text-warning',
    danger: 'bg-danger-light text-danger-dark dark:bg-danger/20 dark:text-danger',
    info: 'bg-info-light text-info-dark dark:bg-info/20 dark:text-info',
    protein: 'bg-blue-50 text-blue-700 border border-blue-100',
    carbs: 'bg-amber-50 text-amber-700 border border-amber-100',
    fat: 'bg-red-50 text-red-700 border border-red-100',
    meal: 'bg-brand-50 text-brand-700 font-bold uppercase tracking-wider text-[10px] px-2',
    outline: 'bg-transparent border border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-xs font-medium transition-all duration-base ${variants[variant]} ${className} relative overflow-hidden`}
      role="status"
      {...props}
    >
      {progress !== undefined && (
        <div 
          className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 transition-all duration-slow" 
          style={{ width: `${progress}%` }}
        />
      )}
      {children}
    </span>
  );
}
