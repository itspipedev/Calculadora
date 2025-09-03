import React, { useState, useCallback } from 'react';
import { Window } from '../../atoms/Window/Window';

export interface WindowConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  props?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'right' | 'bottom' | 'left';
  isResizable?: boolean;
}

export interface WindowState extends WindowConfig {
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export interface WindowManagerProps {
  children?: React.ReactNode;
}

export interface WindowManagerContextType {
  windows: WindowState[];
  openWindow: (config: WindowConfig) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  bringToFront: (id: string) => void;
}

const WindowManagerContext = React.createContext<WindowManagerContextType | null>(null);

export const useWindowManager = () => {
  const context = React.useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used within a WindowManager');
  }
  return context;
};

const WindowManager: React.FC<WindowManagerProps> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);

  const openWindow = useCallback((config: WindowConfig) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === config.id);
      if (existing) {
        // Si ya existe, traerla al frente y abrirla
        return prev.map(w => 
          w.id === config.id 
            ? { ...w, isOpen: true, isMinimized: false, zIndex: nextZIndex }
            : w
        );
      }
      
      // Crear nueva ventana
      const newWindow: WindowState = {
        ...config,
        isOpen: true,
        isMinimized: false,
        zIndex: nextZIndex
      };
      
      return [...prev, newWindow];
    });
    
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => 
      prev.map(w => 
        w.id === id ? { ...w, isMinimized: true } : w
      )
    );
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows(prev => 
      prev.map(w => 
        w.id === id ? { ...w, zIndex: nextZIndex } : w
      )
    );
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const contextValue: WindowManagerContextType = {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    bringToFront
  };

  return (
    <WindowManagerContext.Provider value={contextValue}>
      {children}
      
      {/* Render all windows */}
      {windows.map(window => {
        if (!window.isOpen || window.isMinimized) return null;
        
        const WindowComponent = window.component;
        
        return (
          <div key={window.id} style={{ zIndex: window.zIndex }}>
            <Window
              title={window.title}
              isOpen={window.isOpen}
              size={window.size}
              position={window.position}
              isResizable={window.isResizable}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onMaximize={() => bringToFront(window.id)}
            >
              <WindowComponent {...window.props} />
            </Window>
          </div>
        );
      })}
    </WindowManagerContext.Provider>
  );
};

export { WindowManager };