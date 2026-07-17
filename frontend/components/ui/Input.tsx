import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: ReactNode;
  suffix?: ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', containerClassName = '', label, error, success, icon, suffix, id, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = error ? `${inputId}-error` : undefined;
    const hasValue = (value !== undefined && value !== '') || (props.defaultValue !== undefined && props.defaultValue !== '');

    return (
      <div className={`w-full ${containerClassName}`}>
        <div className="relative group">
          {/* Background Highlight on Focus */}
          <div className={`absolute -inset-0.5 rounded-[22px] bg-green-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none ${error ? 'bg-red-500/10' : ''}`} />

          {/* Floating Label with Motion */}
          {label && (
            <motion.label 
              htmlFor={inputId}
              initial={false}
              animate={{
                top: (isFocused || hasValue) ? -10 : 14,
                left: (isFocused || hasValue) ? 12 : (icon ? 44 : 16),
                scale: (isFocused || hasValue) ? 0.85 : 1,
              }}
              className={`absolute font-bold pointer-events-none z-10 transition-colors duration-300
                ${(isFocused || hasValue) 
                  ? 'px-1.5 text-green-600 bg-white' 
                  : 'text-slate-400'
                }
                ${error ? 'text-red-500' : ''}
                ${success && !error ? 'text-green-500' : ''}
              `}
            >
              {label}
            </motion.label>
          )}

          <div className="relative flex items-center">
            {/* Prefix Icon */}
            {icon && (
              <div className={`absolute left-4 flex items-center pointer-events-none transition-colors duration-300 ${isFocused ? 'text-green-600' : 'text-slate-400'}`}>
                {icon}
              </div>
            )}

            <input
              id={inputId}
              ref={ref}
              value={value}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              aria-invalid={!!error}
              aria-describedby={errorId}
              className={`flex h-14 w-full rounded-[20px] border bg-white px-4 py-2 text-base font-bold text-slate-900 transition-all duration-300
                file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-300 focus:placeholder:opacity-0
                focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50
                ${icon ? 'pl-12' : ''}
                ${(suffix || error || success) ? 'pr-14' : ''}
                ${error 
                  ? 'border-red-500 ring-4 ring-red-500/10' 
                  : isFocused 
                    ? 'border-green-500 ring-4 ring-green-500/10' 
                    : 'border-slate-100 hover:border-slate-200'
                }
                ${className}
              `}
              {...props}
            />

            {/* Suffix / Indicators */}
            <div className="absolute right-4 flex items-center gap-2">
              <AnimatePresence mode="wait">
                {error ? (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-red-500">
                    <FiAlertCircle size={20} />
                  </motion.div>
                ) : success ? (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-green-500">
                    <FiCheckCircle size={20} />
                  </motion.div>
                ) : suffix ? (
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{suffix}</div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Error Message with Slide Animation */}
        <AnimatePresence>
          {error && (
            <motion.p 
              id={errorId} 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mt-2 text-xs text-red-500 font-black uppercase tracking-widest flex items-center gap-2 px-1" 
              role="alert"
            >
              <span className="w-1 h-1 rounded-full bg-red-500"></span>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';
