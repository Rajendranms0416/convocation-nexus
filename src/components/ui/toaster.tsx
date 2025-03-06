
import React, { memo } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

// Memoized toast item component to prevent unnecessary re-renders
const ToastItem = memo(({ 
  id, 
  title, 
  description, 
  action, 
  ...props 
}: {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: any;
  [key: string]: any;
}) => (
  <Toast key={id} {...props}>
    <div className="grid gap-1">
      {title && <ToastTitle>{title}</ToastTitle>}
      {description && (
        <ToastDescription>{description}</ToastDescription>
      )}
    </div>
    {action && action.action}
    <ToastClose />
  </Toast>
));

ToastItem.displayName = 'ToastItem';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <ToastItem
            key={id}
            id={id}
            title={title}
            description={description}
            action={action}
            {...props}
          />
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
