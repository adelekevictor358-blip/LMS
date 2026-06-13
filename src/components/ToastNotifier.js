"use client";

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { X, ShieldAlert, Info } from 'lucide-react';

export default function ToastNotifier() {
  const { activeToast, clearActiveToast } = useStore();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        clearActiveToast();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast, clearActiveToast]);

  if (!activeToast) return null;

  const isUrgent = activeToast.isUrgent;

  return (
    <div
      role="status"
      aria-live={isUrgent ? 'assertive' : 'polite'}
      className={`fixed right-4 top-12 z-[999999] flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-sm animate-fade-in ${
        isUrgent ? 'border-l-2 border-l-destructive border-border' : 'border-l-2 border-l-primary border-border'
      }`}
    >
      <div className={`mt-0.5 shrink-0 ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
        {isUrgent ? <ShieldAlert size={18} strokeWidth={1.75} /> : <Info size={18} strokeWidth={1.75} />}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-medium text-muted-foreground">
          {isUrgent ? 'Urgent notification' : 'Official notice'}
        </h4>
        <p className="mt-1 text-sm leading-relaxed text-foreground text-pretty">
          {activeToast.text}
        </p>
      </div>

      <button
        type="button"
        onClick={clearActiveToast}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <X size={16} />
      </button>
    </div>
  );
}
