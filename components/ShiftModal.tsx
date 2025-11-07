import React from 'react';
import { ClockIcon } from './icons';

interface ShiftModalProps {
  isOpen: boolean;
  onStartShift: () => void;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onStartShift }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm transform transition-all animate-fade-in-up p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-5">
            <ClockIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Ready to Go?</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Your shift is not active. Start your shift to begin making sales.</p>
        <button
          onClick={onStartShift}
          className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors text-lg"
        >
          Start Shift
        </button>
      </div>
    </div>
  );
};

export default ShiftModal;
