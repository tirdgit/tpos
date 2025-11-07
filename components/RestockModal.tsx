import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { ProductWithStock } from '../types';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithStock | null;
  onConfirmRestock: (productId: string, quantityToAdd: number) => void;
  isSubmitting: boolean;
}

const RestockModal: React.FC<RestockModalProps> = ({ isOpen, onClose, product, onConfirmRestock, isSubmitting }) => {
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuantity('');
    }
  }, [isOpen]);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantityToAdd = parseInt(quantity, 10);
    if (quantityToAdd > 0) {
      onConfirmRestock(product.id, quantityToAdd);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Restock: ${product.name}`}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Current Stock</span>
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{product.stock}</span>
          </div>
          <div>
            <label htmlFor="restockQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity to Add
            </label>
            <input
              type="number"
              id="restockQuantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
              step="1"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-2xl text-gray-900 dark:text-gray-100 text-right"
              autoFocus
            />
          </div>
          <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">New Stock Total</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {product.stock + (parseInt(quantity, 10) || 0)}
            </span>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
            Cancel
          </button>
          <button type="submit" disabled={!quantity || parseInt(quantity, 10) <= 0 || isSubmitting} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-300 dark:disabled:bg-cyan-800 disabled:cursor-wait">
            {isSubmitting ? 'Saving...' : 'Confirm Restock'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RestockModal;