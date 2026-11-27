import React, { useEffect } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

/**
 * LogoutConfirmModal
 * Sign Out button click karne ke baad ek confirmation dialog dikhata hai.
 *
 * Props:
 *   isOpen      — boolean, show/hide
 *   onConfirm   — user ne "Yes, sign out" click kiya
 *   onCancel    — user ne cancel kiya ya background click kiya
 *   userName    — optional, greeting ke liye
 */
export function LogoutConfirmModal({ isOpen, onConfirm, onCancel, userName }) {
  // Escape key support
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="logout-modal-backdrop"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="logout-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        {/* Close X */}
        <button
          className="logout-modal-x"
          onClick={onCancel}
          aria-label="Cancel sign out"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="logout-modal-icon-wrap">
          <div className="logout-modal-icon">
            <LogOut size={26} />
          </div>
        </div>

        {/* Text */}
        <h2 id="logout-modal-title" className="logout-modal-title">
          Sign out{userName ? `, ${userName.split(' ')[0]}` : ''}?
        </h2>
        <p className="logout-modal-desc">
          Your progress is saved. You can sign back in anytime to continue from where you left off.
        </p>

        {/* Actions */}
        <div className="logout-modal-actions">
          <button
            id="logout-modal-cancel-btn"
            className="btn btn-ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            id="logout-modal-confirm-btn"
            className="btn logout-modal-confirm-btn"
            onClick={onConfirm}
            autoFocus
          >
            <LogOut size={15} />
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
