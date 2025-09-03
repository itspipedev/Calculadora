import React from 'react';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { useWindowManager } from '../WindowManager/WindowManager';
import { 
  History, 
  Settings, 
  Palette, 
  Calculator,
  Save,
  FileText,
  HelpCircle
} from 'lucide-react';

export interface TaskbarProps {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenThemes: () => void;
  onOpenHelp: () => void;
  onExportData: () => void;
  className?: string;
}

const Taskbar: React.FC<TaskbarProps> = ({
  onOpenHistory,
  onOpenSettings,
  onOpenThemes,
  onOpenHelp,
  onExportData,
  className
}) => {
  const { windows } = useWindowManager();
  
  const taskbarItems = [
    { id: 'history', icon: History, label: 'Historial', onClick: onOpenHistory },
    { id: 'settings', icon: Settings, label: 'Configuración', onClick: onOpenSettings },
    { id: 'themes', icon: Palette, label: 'Temas', onClick: onOpenThemes },
    { id: 'export', icon: Save, label: 'Exportar', onClick: onExportData },
    { id: 'help', icon: HelpCircle, label: 'Ayuda', onClick: onOpenHelp }
  ];

  return (
    <div className={`flex items-center justify-between bg-slate-800 border-t border-slate-700 p-3 ${className}`}>
      {/* App Logo */}
      <div className="flex items-center gap-2">
        <Icon icon={Calculator} size="md" color="primary" />
        <span className="text-sm font-semibold text-white hidden sm:inline">
          Calculadora Pro
        </span>
      </div>

      {/* Taskbar Items */}
      <div className="flex items-center gap-2">
        {taskbarItems.map(item => {
          const isActive = windows.some(w => w.id === item.id && w.isOpen && !w.isMinimized);
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'operator' : 'default'}
              size="sm"
              onClick={item.onClick}
              className="p-2"
              title={item.label}
              data-testid={`taskbar-${item.id}`}
            >
              <Icon icon={item.icon} size="sm" />
              <span className="hidden md:inline ml-1 text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Minimized Windows */}
      <div className="flex items-center gap-1">
        {windows
          .filter(w => w.isMinimized)
          .map(window => (
            <Button
              key={window.id}
              variant="function"
              size="sm"
              onClick={() => {
                // Restore window logic would go here
              }}
              className="p-2 text-xs"
              title={`Restaurar ${window.title}`}
            >
              <FileText size={14} />
            </Button>
          ))
        }
      </div>
    </div>
  );
};

export { Taskbar };