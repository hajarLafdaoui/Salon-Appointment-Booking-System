import React from 'react';
import { X, LogOut } from 'lucide-react';
import './LogoutConfirmModal.css';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm, roleLabel = 'your account' }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="logout-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="logout-modal-icon-container">
          <LogOut size={28} className="logout-modal-icon" />
        </div>
        <h2 className="logout-modal-title">Confirm Logout</h2>
        <p className="logout-modal-text">
          Are you sure you want to log out from {roleLabel}? You will need to sign in again to access it.
        </p>
        <div className="logout-modal-actions">
          <button className="logout-modal-btn logout-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="logout-modal-btn logout-modal-confirm" onClick={onConfirm}>Log Out</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
