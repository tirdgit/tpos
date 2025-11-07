import React, { useState } from 'react';
import Modal from './Modal';
import { BranchManagementModalProps, Branch } from '../types';

const BranchManagementModal: React.FC<BranchManagementModalProps> = ({ isOpen, onClose, branches, onAddBranch }) => {
  const [newBranchName, setNewBranchName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    setIsSubmitting(true);
    await onAddBranch({ name: newBranchName });
    setIsSubmitting(false);
    setNewBranchName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Branch Management" size="md">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Add New Branch</h3>
          <form onSubmit={handleAddBranchSubmit} className="flex space-x-2">
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Enter branch name"
              required
              className="flex-grow mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-gray-100"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 mt-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-300 dark:disabled:bg-cyan-800 disabled:cursor-wait"
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100 border-t pt-4 dark:border-gray-600">
            Existing Branches ({branches.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {branches.map((branch) => (
              <div key={branch.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <span className="font-medium text-gray-800 dark:text-gray-200">{branch.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BranchManagementModal;
