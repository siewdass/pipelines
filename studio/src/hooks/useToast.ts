import { toast } from "sonner";
export { Toaster } from 'sonner'
import { useCallback } from "react";

export function useToast() {

  return {
    success: useCallback((title: string, description?: string) => toast.success(title, { description }), []),
    error: useCallback((title: string, description?: string) => toast.error(title, { description }), []),
    info: useCallback((title: string, description?: string) => toast.info(title, { description }), []),
    warning: useCallback((title: string, description?: string) => toast.warning(title, { description }), []),
    message: useCallback((msg: string) => toast(msg), []),
    dismiss: useCallback((id?: string | number) => toast.dismiss(id), []),
  };
}
