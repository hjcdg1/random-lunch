import React from 'react';

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
}

export default function AlertDialog({
  isOpen,
  title,
  message,
  confirmText = '확인',
  onConfirm,
}: AlertDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onConfirm}></div>

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-3">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
