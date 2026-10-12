import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface IToastAction {
  label: string;
  onClick: () => void;
}

interface IToast {
  id: number;
  message: string;
  isError: boolean;
  action?: IToastAction;
}

type ToastListener = (toast: IToast) => void;

const listeners = new Set<ToastListener>();
let nextToastId = 0;

const show = (toast: Omit<IToast, "id">) => {
  const toastWithId = { ...toast, id: nextToastId++ };
  listeners.forEach((listener) => listener(toastWithId));
};

// can be called from outside React, e.g. the query client's error handler
export const showErrorToast = (message: string) => {
  show({ message, isError: true });
};

export const showToast = (message: string, action?: IToastAction) => {
  show({ message, isError: false, action });
};

export const Toaster = () => {
  const [toast, setToast] = useState<IToast | null>(null);

  useEffect(() => {
    listeners.add(setToast);
    return () => {
      listeners.delete(setToast);
    };
  }, []);

  useEffect(() => {
    if (toast === null) {
      return;
    }
    const timeoutId = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timeoutId);
  }, [toast]);

  if (toast === null) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role={toast.isError ? "alert" : "status"}
        className="pointer-events-auto flex items-center gap-3 rounded-lg bg-gray-800 px-4 py-3 text-sm text-white shadow-lg"
      >
        {toast.message}
        {toast.action !== undefined && (
          <button
            type="button"
            className="rounded font-medium text-indigo-300 hover:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => {
              toast.action?.onClick();
              setToast(null);
            }}
          >
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          className="rounded p-0.5 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
          onClick={() => setToast(null)}
        >
          <span className="sr-only">Dismiss</span>
          <XMarkIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};
