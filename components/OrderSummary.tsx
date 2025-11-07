import React from 'react';
import { OrderItem, Product } from '../types';
import { MinusIcon, PlusIcon, TrashIcon } from './icons';
import { formatCurrency } from '../utils/formatting';

interface OrderSummaryProps {
  orderItems: OrderItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderItems, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = orderItems.reduce((acc, item) => acc + (item.price * item.quantity * (item.taxRate || 0)), 0);
  const total = subtotal + tax;

  return (
    <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b pb-4 dark:border-gray-700">Current Order</h2>
      {orderItems.length === 0 ? (
        <div className="flex-grow flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Your order is empty.</p>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-y-auto pr-2 -mr-2" style={{ maxHeight: 'calc(60vh - 200px)' }}>
            <ul className="space-y-4">
              {orderItems.map((item) => (
                <li key={item.id} className="flex items-center space-x-4">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">
                      <MinusIcon />
                    </button>
                    <span className="w-8 text-center font-medium text-gray-800 dark:text-gray-200">{item.quantity}</span>
                     <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-semibold w-16 text-right text-gray-800 dark:text-gray-200">{formatCurrency(item.price * item.quantity)}</p>
                  <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700">
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t dark:border-gray-700 mt-6 pt-6 space-y-3">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-gray-100">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </>
      )}
       <div className="mt-6">
        <button 
          onClick={onCheckout}
          disabled={orderItems.length === 0}
          className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-300 dark:disabled:bg-cyan-800 disabled:cursor-not-allowed transition-colors"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;