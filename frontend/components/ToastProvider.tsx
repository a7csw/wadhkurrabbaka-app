import React, { useState, useCallback, useEffect } from 'react';
import { Toast, setShowToast } from './Toast';

interface ToastState {
  visible: boolean;
  message: string;
  messageAr?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    text: string;
    onPress: () => void;
  };
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
  });

  const showToast = useCallback((props: Omit<ToastState, 'visible'>) => {
    setToast({
      ...props,
      visible: true,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    setShowToast(showToast);
  }, [showToast]);

  return (
    <>
      {children}
      <Toast
        {...toast}
        onDismiss={hideToast}
      />
    </>
  );
};



