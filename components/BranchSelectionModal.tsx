import React from 'react';
import { Branch } from '../types';
import { BranchIcon } from './icons';

interface BranchSelectionModalProps {
  isOpen: boolean;
  branches: Branch[];
  onSelectBranch: (branch: Branch) => void;
}

const BranchSelectionModal: React.FC<BranchSelectionModalProps> = ({ isOpen, branches, onSelectBranch }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm transform transition-all animate-fade-in-up p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-900/50 mb-4">
            <BranchIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Select a Branch</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Choose which branch you are working at for this session.</p>
        <div className="space-y-3">
          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => onSelectBranch(branch)}
              className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/30 flex items-center space-x-3 transition-colors"
            >
              <BranchIcon className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">{branch.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchSelectionModal;
