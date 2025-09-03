import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { CalculationState, CalculationResult, CalculationMode } from '../types';
import type { Calculation, CalculationResponse } from '@shared/schema';

const initialState: CalculationState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForNewValue: false,
  currentOperation: null,
  mode: 'basic',
  angleUnit: 'deg',
  precision: 10
};

export const useCalculation = () => {
  const [state, setState] = useState<CalculationState>(initialState);
  const { toast } = useToast();

  const calculationMutation = useMutation({
    mutationFn: async (data: Calculation): Promise<CalculationResponse> => {
      const response = await apiRequest('POST', '/api/calculate', data);
      return response.json();
    },
    onSuccess: (data) => {
      const resultValue = data.formatted || data.result.toString();
      setState(prev => ({
        ...prev,
        display: resultValue,
        previousValue: null,
        operation: null,
        waitingForNewValue: true,
        currentOperation: null
      }));
      
      if (data.error) {
        toast({
          title: 'Advertencia',
          description: data.error,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error de Cálculo',
        description: error.message,
        variant: 'destructive',
      });
      setState(prev => ({
        ...prev,
        display: 'Error',
        previousValue: null,
        operation: null,
        waitingForNewValue: true,
        currentOperation: null
      }));
    },
  });

  const inputNumber = useCallback((num: string) => {
    setState(prev => {
      if (prev.waitingForNewValue) {
        return { ...prev, display: num, waitingForNewValue: false };
      } else {
        return { ...prev, display: prev.display === '0' ? num : prev.display + num };
      }
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState(prev => {
      if (prev.waitingForNewValue) {
        return { ...prev, display: '0.', waitingForNewValue: false };
      } else if (prev.display.indexOf('.') === -1) {
        return { ...prev, display: prev.display + '.' };
      }
      return prev;
    });
  }, []);

  const inputOperation = useCallback((nextOperation: string) => {
    setState(prev => {
      const inputValue = parseFloat(prev.display);

      if (prev.previousValue === null) {
        return {
          ...prev,
          previousValue: inputValue,
          waitingForNewValue: true,
          operation: nextOperation,
          currentOperation: nextOperation
        };
      } else if (prev.operation) {
        const currentValue = prev.previousValue || 0;
        
        calculationMutation.mutate({
          type: 'basic',
          operation: prev.operation as any,
          a: currentValue,
          b: inputValue,
        });
        
        return prev;
      }

      return {
        ...prev,
        waitingForNewValue: true,
        operation: nextOperation,
        currentOperation: nextOperation
      };
    });
  }, [calculationMutation]);

  const calculate = useCallback(() => {
    setState(prev => {
      if (prev.operation && prev.previousValue !== null) {
        const inputValue = parseFloat(prev.display);
        
        calculationMutation.mutate({
          type: 'basic',
          operation: prev.operation as any,
          a: prev.previousValue,
          b: inputValue,
        });
      }
      return prev;
    });
  }, [calculationMutation]);

  const executeAdvancedOperation = useCallback((op: string, requiresSecondValue = false) => {
    const a = parseFloat(state.display);
    if (isNaN(a)) return;

    let adjustedA = a;
    // Convertir ángulos si es necesario
    if (['sin', 'cos', 'tan'].includes(op) && state.angleUnit === 'deg') {
      adjustedA = (a * Math.PI) / 180;
    }

    if (requiresSecondValue) {
      setState(prev => ({
        ...prev,
        previousValue: adjustedA,
        operation: op,
        waitingForNewValue: true,
        currentOperation: op
      }));
    } else {
      calculationMutation.mutate({
        type: 'advanced',
        operation: op as any,
        a: adjustedA,
      });
    }
  }, [state.display, state.angleUnit, calculationMutation]);

  const insertConstant = useCallback((constant: string) => {
    calculationMutation.mutate({
      type: 'constant',
      operation: constant as any,
    });
  }, [calculationMutation]);

  const clearAll = useCallback(() => {
    setState(initialState);
  }, []);

  const clearEntry = useCallback(() => {
    setState(prev => ({ ...prev, display: '0', waitingForNewValue: false }));
  }, []);

  const toggleSign = useCallback(() => {
    setState(prev => {
      if (prev.display !== '0') {
        return {
          ...prev,
          display: prev.display.charAt(0) === '-' ? prev.display.slice(1) : '-' + prev.display
        };
      }
      return prev;
    });
  }, []);

  const setMode = useCallback((mode: CalculationMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const setAngleUnit = useCallback((unit: 'deg' | 'rad') => {
    setState(prev => ({ ...prev, angleUnit: unit }));
  }, []);

  return {
    state,
    actions: {
      inputNumber,
      inputDecimal,
      inputOperation,
      calculate,
      executeAdvancedOperation,
      insertConstant,
      clearAll,
      clearEntry,
      toggleSign,
      setMode,
      setAngleUnit
    },
    isLoading: calculationMutation.isPending
  };
};