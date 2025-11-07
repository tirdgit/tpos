
import React, { useState } from 'react';
import Modal from './Modal';
import { UserManagementModalProps, User, UserRole } from '../types';

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose, users, onAddUser }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Cashier');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.name.toLowerCase() === newUsername.toLowerCase())) {
        setError('Username already exists.');
        return;
    }
    setError('');
    setIsSubmitting(true);
    // FIX: Pass user data without branchIds. This is now handled by the `onAddUser` implementation in App.tsx.
    await onAddUser({ name: newUsername, password: newPassword, role: newRole });
    setIsSubmitting(false);
    setNewUsername('');
    setNewPassword('');
    setNewRole('Cashier');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Management" size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User List */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 dark:border-gray-600">
            Existing Users ({users.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {users.map((user) => (
              <div key={user.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <span className="font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'Admin' ? 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add User Form */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 dark:border-gray-600">Add New User</h3>
          <form onSubmit={handleAddUserSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label htmlFor="new-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                className="mt-1 block w-full input-style"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 block w-full input-style"
              />
            </div>
            <div>
              <label htmlFor="new-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select
                id="new-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="mt-1 block w-full input-style"
              >
                <option value="Cashier">Cashier</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-300 dark:disabled:bg-cyan-800 disabled:cursor-wait"
              >
                {isSubmitting ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default UserManagementModal;