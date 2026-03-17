import { toast } from "sonner";
export { Toaster } from 'sonner'
import { useCallback } from "react";

export function useToast() {

  return {
    success: useCallback((message: string) => toast.success(message), []),
    error: useCallback((message: string) => toast.error(message), []),
    info: useCallback((message: string) => toast.info(message), []),
    warning: useCallback((message: string) => toast.warning(message), []),
    message: useCallback((msg: string) => toast(msg), []),
    dismiss: useCallback((id?: string | number) => toast.dismiss(id), []),
  };
}
