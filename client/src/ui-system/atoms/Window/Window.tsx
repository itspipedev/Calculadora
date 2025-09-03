import React from 'react';
import { X, Minus, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'right' | 'bottom' | 'left';
  isResizable?: boolean;
  className?: string;
}

const Window: React.FC<WindowProps> = ({
  title,
  isOpen,
  onClose,
  onMinimize,
  onMaximize,
  children,
  size = 'md',
  position = 'center',
  isResizable = false,
  className
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'w-80 h-96',
    md: 'w-96 h-[500px]',
    lg: 'w-[600px] h-[600px]',
    xl: 'w-[800px] h-[700px]',
    full: 'w-full h-full'
  };

  const positions = {
    center: 'inset-0 m-auto',
    top: 'top-4 left-1/2 -translate-x-1/2',
    right: 'top-1/2 right-4 -translate-y-1/2',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    left: 'top-1/2 left-4 -translate-y-1/2'
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in-0"
        onClick={onClose}
      />
      
      {/* Window */}
      <div 
        className={cn(
          'fixed z-50 bg-slate-900 rounded-xl shadow-2xl border border-slate-700',
          'animate-in zoom-in-95 slide-in-from-bottom-4 duration-300',
          sizes[size],
          positions[position],
          isResizable && 'resize overflow-auto',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800 rounded-t-xl">
          <h3 className="text-sm font-semibold text-white truncate">
            {title}
          </h3>
          
          <div className="flex items-center gap-2">
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="p-1 rounded-full hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                data-testid="window-minimize"
              >
                <Minus size={14} />
              </button>
            )}
            
            {onMaximize && (
              <button
                onClick={onMaximize}
                className="p-1 rounded-full hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                data-testid="window-maximize"
              >
                <Square size={14} />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-red-600 text-gray-400 hover:text-white transition-colors"
              data-testid="window-close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 h-full overflow-auto">
          {children}
        </div>
      </div>
    </>
  );
};

export { Window };