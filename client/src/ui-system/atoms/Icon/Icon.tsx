import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconProps {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const Icon: React.FC<IconProps> = ({ 
  icon: IconComponent, 
  size = 'md', 
  className,
  color = 'default' 
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const colors = {
    default: 'text-current',
    primary: 'text-blue-500',
    secondary: 'text-gray-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  return (
    <IconComponent 
      className={cn(sizes[size], colors[color], className)} 
    />
  );
};

export { Icon };