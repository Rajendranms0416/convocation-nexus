
import { useState } from 'react';
import { Toast } from "@/components/ui/toast";

type ToastProps = React.ComponentProps<typeof Toast>;

export interface ToastActionElement {
  altText: string;
  action: React.ReactNode;
}

export type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  duration?: number;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToast = ToastOptions & {
  id: string;
  open: boolean;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function createToast(props: ToastOptions) {
  const id = count++;
  const toast: ToasterToast = {
    ...props,
    id: String(id),
    open: true,
  };
  return toast;
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId ? { ...t, open: false } : t
          ),
        };
      }

      return {
        ...state,
        toasts: state.toasts.map((t) => ({ ...t, open: false })),
      };
    }

    case "REMOVE_TOAST": {
      const { toastId } = action;

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        };
      }

      return {
        ...state,
        toasts: [],
      };
    }
  }
};

function useStateReducer(reducer: React.Reducer<State, Action>): [State, React.Dispatch<Action>] {
  const [state, setState] = useState<State>({ toasts: [] });

  const dispatch = (action: Action) => {
    const newState = reducer(state, action);
    setState(newState);
    return newState;
  };

  return [state, dispatch];
}

export function useToast() {
  const [state, dispatch] = useStateReducer(reducer);

  const toast = (props: ToastOptions) => {
    const toasterToast = createToast(props);
    dispatch({ type: "ADD_TOAST", toast: toasterToast });

    return {
      id: toasterToast.id,
      dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: toasterToast.id }),
      update: (props: ToastOptions) =>
        dispatch({
          type: "UPDATE_TOAST",
          toast: { ...props, id: toasterToast.id },
        }),
    };
  };

  const dismiss = (toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId });
  };

  return {
    toasts: state.toasts,
    toast,
    dismiss,
  };
}

// Create a toast function that can be imported directly
const toastFunction = (props: ToastOptions) => {
  console.warn("You are trying to use toast outside of a component. This won't work properly.");
  return {
    id: "0",
    dismiss: () => {},
    update: () => {},
  };
};

toastFunction.dismiss = (toastId?: string) => {};

// Export the toast function
export const toast = toastFunction;
