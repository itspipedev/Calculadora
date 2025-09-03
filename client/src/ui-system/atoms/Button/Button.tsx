import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'number' | 'operator' | 'function' | 'scientific' | 'memory';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isActive?: boolean;
  isPressed?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    isActive = false, 
    isPressed = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center rounded-full',
      'font-medium transition-all duration-150 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'user-select-none relative overflow-hidden',
      'hover:transform hover:-translate-y-0.5 hover:scale-105',
      'active:transform active:translate-y-0.5 active:scale-95'
    ];

    const variants = {
      default: [
        'bg-slate-700 text-white shadow-lg',
        'hover:bg-slate-600 hover:shadow-xl',
        'active:bg-slate-800 focus:ring-slate-500'
      ],
      number: [
        'bg-slate-600 text-white shadow-neo-outset',
        'hover:shadow-neo-hover hover:bg-slate-500',
        'active:shadow-neo-pressed',
        isActive && 'bg-slate-400'
      ],
      operator: [
        'bg-orange-500 text-white shadow-neo-outset',
        'hover:shadow-neo-hover hover:bg-orange-400',
        'active:shadow-neo-pressed',
        isActive && 'bg-white text-orange-500'
      ],
      function: [
        'bg-slate-500 text-white shadow-neo-outset',
        'hover:shadow-neo-hover hover:bg-slate-400',
        'active:shadow-neo-pressed'
      ],
      scientific: [
        'bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-neo-outset',
        'hover:shadow-neo-hover hover:from-purple-500 hover:to-purple-700',
        'active:shadow-neo-pressed'
      ],
      memory: [
        'bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-neo-outset',
        'hover:shadow-neo-hover hover:from-blue-500 hover:to-blue-700',
        'active:shadow-neo-pressed'
      ]
    };

    const sizes = {
      sm: 'w-12 h-12 text-sm',
      md: 'w-16 h-16 text-base',
      lg: 'w-20 h-20 text-lg',
      xl: 'w-24 h-24 text-xl'
    };

    const classes = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      isPressed && 'animate-pulse',
      className
    );

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 hover:opacity-10" />
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };