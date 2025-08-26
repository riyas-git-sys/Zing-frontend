// src/components/LeaveGroupModal.tsx
import { useState } from 'react';

interface LeaveGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  groupName: string;
}

function LeaveGroupModal({ isOpen, onClose, onConfirm, groupName }: LeaveGroupModalProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleConfirm = async () => {
    setIsLeaving(true);
    await onConfirm();
    setIsLeaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Leave Group</h2>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to leave the group "{groupName}"? You won't be able to rejoin unless you're added back by an admin.
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLeaving}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={isLeaving}
          >
            {isLeaving ? 'Leaving...' : 'Leave Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeaveGroupModal;