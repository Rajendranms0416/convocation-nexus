
// Re-export from useToast for backward compatibility
import { useToast as useToastOriginal, toast as toastOriginal } from '@radix-ui/react-toast';

type ToastProps = Parameters<typeof toastOriginal>[0];

export const useToast = useToastOriginal;
export const toast = toastOriginal;

export type { ToastProps };
