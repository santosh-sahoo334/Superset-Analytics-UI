/* eslint-disable */
import { Toast } from "primereact/toast";
import { createContext, ReactNode, useContext, useRef } from "react";

interface ToastContextProps {
  toast: any;
  showToast: (
    message: string,
    severityValue: "success" | "info" | "warn" | "error",
    summary: string
  ) => void;
}

const ToastContext = createContext<ToastContextProps>({
  toast: null,
  showToast: () => {},
});

const ToastState = () => {
  const toast = useRef<any>();
  const showToast = (
    message: string,
    severityValue: "success" | "info" | "warn" | "error",
    summary: string
  ) => {
    toast.current?.show({
      severity: severityValue,
      summary,
      detail: message,
      life: 2000,
    });
  };

  return {
    showToast,
    toast,
  };
};

interface ToastProviderProps {
  children: ReactNode;
}
export function ToastProvider({ children }: ToastProviderProps): JSX.Element {
  const values = ToastState();
  return (
    <ToastContext.Provider value={values}>
      <Toast ref={values.toast} />
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
