import React from 'react';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { Calculator, Sigma, PieChart, TrendingUp, Shapes, Grid3X3 } from 'lucide-react';

export type CalculatorMode = 'basic' | 'scientific' | 'financial' | 'statistics' | 'geometry' | 'matrix';

export interface ModeToggleProps {
  currentMode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
  className?: string;
}

const ModeToggle: React.FC<ModeToggleProps> = ({
  currentMode,
  onModeChange,
  className
}) => {
  const modes = [
    { mode: 'basic' as const, label: 'Básica', icon: Calculator },
    { mode: 'scientific' as const, label: 'Científica', icon: Sigma },
    { mode: 'financial' as const, label: 'Financiera', icon: TrendingUp },
    { mode: 'statistics' as const, label: 'Estadística', icon: PieChart },
    { mode: 'geometry' as const, label: 'Geometría', icon: Shapes },
    { mode: 'matrix' as const, label: 'Matrices', icon: Grid3X3 }
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {modes.map(({ mode, label, icon }) => (
        <Button
          key={mode}
          variant={currentMode === mode ? 'operator' : 'default'}
          size="sm"
          onClick={() => onModeChange(mode)}
          className="px-3 py-2 text-xs"
          data-testid={`mode-${mode}`}
        >
          <div className="flex items-center gap-1">
            <Icon icon={icon} size="xs" />
            <span className="hidden sm:inline">{label}</span>
          </div>
        </Button>
      ))}
    </div>
  );
};

export { ModeToggle };