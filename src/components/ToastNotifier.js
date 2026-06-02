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

  return (
    <div className={`toast-container animate-slide-up ${activeToast.isUrgent ? 'urgent' : ''}`}>
      <div className="toast-icon">
        {activeToast.isUrgent ? <ShieldAlert size={20} /> : <Info size={20} />}
      </div>
      <div className="toast-content">
        <h4>{activeToast.isUrgent ? 'URGENT NOTIFICATION' : 'Official Notice'}</h4>
        <p>{activeToast.text}</p>
      </div>
      <button className="close-toast" onClick={clearActiveToast}><X size={16}/></button>

      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 3rem;
          right: 2rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: #ffffff;
          color: #111827;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
          z-index: 999999;
          width: 400px;
          border-left: 5px solid var(--primary);
        }

        .toast-container.urgent {
          border-left-color: var(--danger);
        }

        :global([data-theme='dark']) .toast-container {
          background: #1f2937;
          color: #f9fafb;
          border-color: #374151;
        }

        .toast-icon {
          color: var(--primary);
        }
        
        .toast-container.urgent .toast-icon {
          color: var(--danger);
        }

        .toast-content {
          flex: 1;
        }

        .toast-content h4 {
          font-size: 0.75rem;
          text-transform: uppercase;
          margin-bottom: 0.35rem;
          color: #6b7280;
          font-weight: 700;
        }
        :global([data-theme='dark']) .toast-content h4 {
          color: #9ca3af;
        }

        .toast-content p {
          font-size: 0.95rem;
          line-height: 1.4;
          font-weight: 600;
        }

        .close-toast {
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
        }

        .close-toast:hover {
          color: #111827;
        }
        :global([data-theme='dark']) .close-toast {
          color: #9ca3af;
        }
        :global([data-theme='dark']) .close-toast:hover {
          color: #ffffff;
        }

        @keyframes slideIn {
          from { right: -25rem; opacity: 0; }
          to { right: 2rem; opacity: 1; }
        }

        .animate-slide-up {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
