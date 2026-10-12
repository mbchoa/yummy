import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface IToast {
  id: number;
  message: string;
}

type ToastListener = (toast: IToast) => void;

const listeners = new Set<ToastListener>();
let nextToastId = 0;

// can be called from outside React, e.g. the query client's error handler
export const showErrorToast = (message: string) => {
  const toast = { id: nextToastId++, message };
  listeners.forEach((listener) => listener(toast));
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
        role="alert"
        className="pointer-events-auto flex items-center gap-3 rounded-lg bg-gray-800 px-4 py-3 text-sm text-white shadow-lg"
      >
        {toast.message}
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
