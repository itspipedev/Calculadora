import React from 'react';
import { cn } from '@/lib/utils';

export interface DisplayProps {
  value: string;
  isLoading?: boolean;
  hasError?: boolean;
  memoryValue?: number;
  className?: string;
}

const Display: React.FC<DisplayProps> = ({ 
  value, 
  isLoading = false, 
  hasError = false,
  memoryValue,
  className 
}) => {
  const formatDisplay = (val: string) => {
    if (hasError || val === "Error" || val === "∞" || val === "-∞") return val;
    const num = parseFloat(val);
    if (isNaN(num)) return "0";
    
    // Si el número es muy grande, usar notación científica
    if (Math.abs(num) >= 1e9) {
      return num.toExponential(6);
    }
    
    // Limitar decimales para que quepa en pantalla
    return val.length > 12 ? num.toPrecision(8) : val;
  };

  return (
    <div className={cn(
      'calc-display bg-slate-800 rounded-2xl p-6 min-h-[120px]',
      'flex flex-col justify-end items-end shadow-inner',
      'border border-slate-700',
      className
    )}>
      <div className="w-full space-y-2">
        {isLoading && (
          <div className="text-right text-sm text-orange-400 animate-pulse">
            Calculando...
          </div>
        )}
        
        <div 
          className={cn(
            'text-right text-4xl font-light break-all',
            'transition-all duration-300',
            hasError ? 'text-red-400' : 'text-white',
            isLoading && 'opacity-60'
          )}
          data-testid="display"
        >
          {formatDisplay(value)}
        </div>
        
        {memoryValue !== undefined && memoryValue !== 0 && (
          <div className="text-right text-xs text-blue-400 flex items-center justify-end gap-1">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            M: {memoryValue}
          </div>
        )}
      </div>
    </div>
  );
};

export { Display };