
"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";

// UTILITY
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// TYPES
type ToastTypes = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default';

type ToastClassnames = {
  toast?: string;
  title?: string;
  description?: string;
  loader?: string;
  closeButton?: string;
  cancelButton?: string;
  actionButton?: string;
  icon?: string;
};

export type ToastT = {
  id: number | string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  duration?: number;
  important?: boolean;
  action?: ({ close }: { close: () => void }) => React.ReactNode;
  cancel?: ({ close }: { close: () => void }) => React.ReactNode;
  onDismiss?: (toast: ToastT) => void;
  onAutoClose?: (toast: ToastT) => void;
  promise?: Promise<any> | (() => Promise<any>);
  success?: string | React.ReactNode | ((data: any) => React.ReactNode | string);
  error?: string | React.ReactNode | ((error: any) => React.ReactNode | string);
  loading?: string | React.ReactNode;
  finally?: () => void | Promise<void>;
  classNames?: ToastClassnames;
  type?: ToastTypes;
  open?: boolean; // Internal state
};

type ToastOptions = {
    classNames?: ToastClassnames;
    description?: string | React.ReactNode;
    duration?: number;
    cancel?: ({ close }: { close: () => void; }) => React.ReactNode;
    action?: ({ close }: { close: () => void; }) => React.ReactNode;
    icon?: React.ReactNode;
    important?: boolean;
    onDismiss?: (toast: ToastT) => void;
    onAutoClose?: (toast: ToastT) => void;
    id?: number | string;
};

type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);
type PromiseData<ToastData = any> = {
    loading?: string | React.ReactNode;
    success?: string | React.ReactNode | ((data: ToastData) => React.ReactNode | string);
    error?: string | React.ReactNode | ((error: any) => React.ReactNode | string);
    finally?: () => void | Promise<void>;
};

type State = {
  toasts: ToastT[];
};

type ActionType =
  | { type: 'ADD_TOAST'; toast: ToastT; }
  | { type: 'DISMISS_TOAST'; toastId?: number | string; }
  | { type: 'REMOVE_TOAST'; toastId?: number | string; }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToastT>; }
  | { type: 'UPSERT_TOAST'; toast: ToastT; };

// CONSTANTS
const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;
const ACTION_TYPES = ['loading', 'success', 'error'] as const;

// STATE MANAGEMENT
let toastsCounter = 0;
let memoryState: State = { toasts: [] };
const listeners: Array<(state: State) => void> = [];

const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map(t => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };
    case 'UPSERT_TOAST': {
      const { toast } = action;
      return state.toasts.find(t => t.id === toast.id)
        ? reducer(state, { type: 'UPDATE_TOAST', toast })
        : reducer(state, { type: 'ADD_TOAST', toast });
    }
    case 'DISMISS_TOAST': {
      const { toastId } = action;
      if (toastId === undefined) {
        state.toasts.forEach(t => t.onDismiss?.(t));
        return { ...state, toasts: [] };
      }
      return {
        ...state,
        toasts: state.toasts.map(t => {
            if (t.id === toastId) {
                t.onDismiss?.(t);
                return { ...t, open: false }
            }
            return t;
        }),
      };
    }
    case 'REMOVE_TOAST': {
      const { toastId } = action;
      if (toastId === undefined) {
        return { ...state, toasts: [] };
      }
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== toastId),
      };
    }
  }
   return state;
};

const dispatch = (action: ActionType) => {
  memoryState = reducer(memoryState, action);
  listeners.forEach(listener => {
    listener(memoryState);
  });
};

// TOAST FUNCTIONS
const toast = (message: string | React.ReactNode, data?: ToastOptions): number | string => {
  const id = data?.id || toastsCounter++;
  dispatch({ type: 'ADD_TOAST', toast: { ...data, id, title: message, open: true } });
  return id;
};

toast.message = toast;

toast.success = (message: string | React.ReactNode, data?: ToastOptions) => {
  const id = data?.id || toastsCounter++;
  dispatch({ type: 'ADD_TOAST', toast: { ...data, id, title: message, type: 'success', open: true } });
  return id;
};

toast.info = (message: string | React.ReactNode, data?: ToastOptions) => {
  const id = data?.id || toastsCounter++;
  dispatch({ type: 'ADD_TOAST', toast: { ...data, id, title: message, type: 'info', open: true } });
  return id;
};

toast.warning = (message: string | React.ReactNode, data?: ToastOptions) => {
  const id = data?.id || toastsCounter++;
  dispatch({ type: 'ADD_TOAST', toast: { ...data, id, title: message, type: 'warning', open: true } });
  return id;
};

toast.error = (message: string | React.ReactNode, data?: ToastOptions) => {
  const id = data?.id || toastsCounter++;
  dispatch({ type: 'ADD_TOAST', toast: { ...data, id, title: message, type: 'error', open: true } });
  return id;
};

toast.action = (message: string | React.ReactNode, data: ToastOptions) => {
  const id = data.id || toastsCounter++;
  dispatch({ type: 'ADD_TOAST', toast: { ...data, id, title: message, type: 'action', open: true } });
  return id;
};

toast.promise = <ToastData,>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => {
  const id = data?.loading ? toastsCounter++ : undefined;
  if(id) {
    dispatch({ type: 'ADD_TOAST', toast: { ...data, promise, id, type: 'loading', title: data.loading, open: true } });
  }

  const p = promise instanceof Promise ? promise : promise();

  p.then(promiseData => {
    const success = data?.success;
    const toastMessage = typeof success === 'function' ? success(promiseData) : success;
    if (id) {
      dispatch({ type: 'UPDATE_TOAST', toast: { id, type: 'success', title: toastMessage } });
    } else if (toastMessage) {
        toast.success(toastMessage);
    }
  })
    .catch(error => {
      const err = data?.error;
      const toastMessage = typeof err === 'function' ? err(error) : err;
      if(id) {
          dispatch({ type: 'UPDATE_TOAST', toast: { id, type: 'error', title: toastMessage } });
      } else if (toastMessage) {
          toast.error(toastMessage);
      }
    })
    .finally(data?.finally);

  return id;
};

toast.dismiss = (id?: number | string) => {
  dispatch({ type: 'DISMISS_TOAST', toastId: id });
};

// REACT COMPONENTS
type ToasterProps = Omit<React.ComponentProps<'ol'>, 'children'> & {
    theme?: 'light' | 'dark' | 'system';
    toastOptions?: ToastOptions;
    closeButton?: boolean;
    position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
    icons?: Partial<Record<ToastTypes, React.ReactNode>>;
};

const useStore = (toastOptions: ToasterProps) => {
  const [state, setState] = useState<State>(memoryState);
  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    toasts: state.toasts,
    toastOptions: { ...toastOptions, ...toastOptions.toastOptions },
  };
};

function Loader({ type }: { type: ToastTypes }) {
  const isError = type === 'error';
  const isSuccess = type === 'success';

  if (type === 'loading') {
    return (
      <div
        data-sonner-loader=""
        className="w-5 h-5 border-2 rounded-full border-neutral-900 dark:border-neutral-50 border-t-transparent dark:border-t-transparent animate-spin"
      />
    );
  }

  return (
    <div data-icon="" className="w-5 h-5 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('w-full h-full', isError ? 'text-red-500' : isSuccess ? 'text-green-500' : 'text-neutral-900 dark:text-neutral-50')}
      >
        {isError ? (
          <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </>
        ) : isSuccess ? (
          <>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </>
        ) : null}
      </svg>
    </div>
  );
}


function ToastComponent(props: ToastT & { toastOptions?: Omit<ToasterProps, 'id'> & ToastOptions, closeButton?: boolean }) {
    const {
        type = 'normal',
        id,
        title,
        icon: toastIcon,
        description,
        duration: durationFromToast,
        cancel,
        action,
        important,
        classNames,
        toastOptions,
        closeButton,
    } = props;
    const [open, setOpen] = useState(props.open);
    const [removed, setRemoved] = useState(false);
    const duration = durationFromToast ?? toastOptions?.duration ?? TOAST_REMOVE_DELAY;
    const toastRef = useRef<HTMLLIElement>(null);

    const close = () => setOpen(false);

    useEffect(() => {
        if (!open) {
          const removeToast = () => {
            setRemoved(true);
            dispatch({ type: 'REMOVE_TOAST', toastId: id });
            props.onDismiss?.(props);
          };
          const timeoutId = setTimeout(removeToast, 200); // Animation duration
          return () => clearTimeout(timeoutId);
        }
    }, [open, id, props]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setOpen(false);
            props.onAutoClose?.(props);
        }, duration);
        return () => clearTimeout(timeoutId);
    }, [duration, props]);
    
    if (removed) return null;

    return (
        <li
            ref={toastRef}
            className={cn(
                'group w-full flex items-center justify-between p-4 rounded-md border will-change-transform',
                'bg-white text-neutral-950 border-neutral-200 shadow-lg',
                'dark:bg-neutral-950 dark:text-neutral-50 dark:border-neutral-800',
                open ? 'animate-in slide-in-from-bottom-5' : 'animate-out slide-out-to-top-5 fill-mode-forwards',
                'pointer-events-auto',
                toastOptions?.classNames?.toast,
                classNames?.toast
            )}
            data-sonner-toast=""
            data-type={type}
            data-important={important ? 'true' : 'false'}
        >
            <div className="flex items-center gap-4">
                {toastIcon || (toastOptions?.icons && (toastOptions.icons as any)[type]) || (type && <Loader type={type} />)}
                <div data-content="">
                    <div data-title="" className={cn('font-semibold', classNames?.title, toastOptions?.classNames?.title)}>
                        {title}
                    </div>
                    {description && (
                        <div data-description="" className={cn('text-sm text-neutral-500 dark:text-neutral-400', classNames?.description, toastOptions?.classNames?.description)}>
                            {description}
                        </div>
                    )}
                </div>
            </div>
            {closeButton && (
                <button
                    data-close-button=""
                    onClick={close}
                    className={cn(
                        'absolute top-2 right-2 p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500',
                        toastOptions?.classNames?.closeButton,
                        classNames?.closeButton
                    )}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}
            {action && (
                <div
                    data-button=""
                    data-action=""
                    className={cn('ml-auto', toastOptions?.classNames?.actionButton, classNames?.actionButton)}
                >
                    {action({ close })}
                </div>
            )}
            {cancel && (
                <div
                    data-button=""
                    data-cancel=""
                    className={cn('ml-2', toastOptions?.classNames?.cancelButton, classNames?.cancelButton)}
                >
                    {cancel({ close })}
                </div>
            )}
        </li>
    );
}

const positionClasses: Record<NonNullable<ToasterProps['position']>, string> = {
  'top-left': 'top-0 left-0',
  'top-right': 'top-0 right-0',
  'top-center': 'top-0 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-0 left-0',
  'bottom-right': 'bottom-0 right-0',
  'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
};

const SonnerComponent = forwardRef<HTMLOListElement, ToasterProps>((props, ref) => {
    const { toasts, toastOptions } = useStore(props);
    const { className, position = 'bottom-right', ...rest } = props;
    return (
        <section aria-label="Notifications" tabIndex={-1}>
            <ol
                ref={ref}
                tabIndex={-1}
                className={cn('fixed z-50 flex flex-col gap-2 p-4 w-full sm:w-auto', positionClasses[position], className)}
                {...rest}
            >
                {toasts.map((toast) => (
                    <ToastComponent key={toast.id} {...toast} toastOptions={toastOptions} closeButton={props.closeButton} />
                ))}
            </ol>
        </section>
    );
});
SonnerComponent.displayName = 'Sonner';


const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerComponent
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-950 group-[.toaster]:border-neutral-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-neutral-950 dark:group-[.toaster]:text-neutral-50 dark:group-[.toaster]:border-neutral-800",
          description: "group-[.toast]:text-neutral-500 dark:group-[.toast]:text-neutral-400",
          actionButton:
            "group-[.toast]:bg-neutral-900 group-[.toast]:text-neutral-50 dark:group-[.toast]:bg-neutral-50 dark:group-[.toast]:text-neutral-900",
          cancelButton:
            "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500 dark:group-[.toast]:bg-neutral-800 dark:group-[.toast]:text-neutral-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
