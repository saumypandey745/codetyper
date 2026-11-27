import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { LogOut, X } from 'lucide-react';

/**
 * LogoutConfirmModal — portal ke through document.body mein render hota hai
 * taaki parent header/transform se affect na ho aur properly center dikhe.
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
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const modal = (
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

  // Portal: document.body mein directly render karo
  return ReactDOM.createPortal(modal, document.body);
}
