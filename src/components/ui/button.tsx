'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-black text-white hover:bg-gray-800 focus:ring-gray-900',
      secondary: 'bg-gray-100 text-black hover:bg-gray-200 focus:ring-gray-300',
      outline: 'border border-gray-300 text-black hover:bg-gray-50 focus:ring-gray-300',
      ghost: 'text-gray-600 hover:text-black hover:bg-gray-100 focus:ring-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    // Size styles with minimum touch targets (44px) for mobile accessibility
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm gap-1.5 min-h-[44px]',
      md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
      lg: 'px-6 py-3 text-base gap-2 min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled ?? isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
