
import { useState, useEffect } from 'react';
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import { useToast as useToastUI } from "@/components/ui/use-toast";

export type ToastOptions = NonNullable<Parameters<typeof useToastUI>[0]["toast"]>[0];

export function useToast() {
  const { toast: toastUI } = useToastUI();

  function toast(props: ToastOptions) {
    return toastUI(props);
  }

  return {
    toast
  };
}

export { toast } from "@/components/ui/use-toast";
