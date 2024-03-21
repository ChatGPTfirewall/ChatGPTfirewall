import React, { createContext, useContext, ReactNode } from 'react';
import {
  Toaster,
  useToastController,
  Toast,
  ToastTitle,
  ToastBody,
  ToastIntent
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';

const ToastContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showToast: (_message: string, _type: ToastIntent) => {}
});

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const { t } = useTranslation();
  const toasterId = 'mainToaster';
  const { dispatchToast } = useToastController(toasterId);

  const showToast = (message: string, type: ToastIntent) => {
    const titles: Record<ToastIntent, string> = {
      success: t('actionSuccessful'),
      error: t('actionFailed'),
      warning: t('actionWarning'),
      info: t('actionNotice')
    };

    const title = titles[type] || t('actionNotice');

    const toastContent = (
      <Toast>
        <ToastTitle>{title}</ToastTitle>
        <ToastBody>{message}</ToastBody>
      </Toast>
    );

    dispatchToast(toastContent, { intent: type });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toaster position="top" toasterId={toasterId} />
      {children}
    </ToastContext.Provider>
  );
};
