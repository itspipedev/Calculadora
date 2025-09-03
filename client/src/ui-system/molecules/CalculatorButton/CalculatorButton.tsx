import React from 'react';
import { Button, ButtonProps } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { LucideIcon } from 'lucide-react';

export interface CalculatorButtonProps extends Omit<ButtonProps, 'children'> {
  value: string | number;
  icon?: LucideIcon;
  label?: string;
  onCalculatorClick: (value: string) => void;
  isWide?: boolean;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  value,
  icon,
  label,
  onCalculatorClick,
  isWide = false,
  variant = 'number',
  className,
  ...props
}) => {
  const handleClick = () => {
    onCalculatorClick(value.toString());
  };

  const buttonClasses = isWide ? 'col-span-2 rounded-full px-8' : '';

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={`${buttonClasses} ${className}`}
      data-testid={`calc-button-${value}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-1">
        {icon && <Icon icon={icon} size="sm" />}
        <span>{label || value}</span>
      </div>
    </Button>
  );
};

export { CalculatorButton };