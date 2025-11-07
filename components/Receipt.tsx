import React from 'react';
import { CompletedOrder, Branch } from '../types';
import { formatCurrency } from '../utils/formatting';

interface ReceiptProps {
  order: CompletedOrder;
  branch: Branch | null;
}

const Receipt: React.FC<ReceiptProps> = ({ order, branch }) => {
  return (
    <div id="receipt-printable-area" className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-1 font-mono">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">{branch?.name || 'POS Cafe'}</h2>
        <p>123 Java Lane, Silicon Valley</p>
        <p>Receipt #{order.id.slice(-6)}</p>
      </div>
      
      <div className="mb-2 text-xs">
          <p>Date: {order.date}</p>
          <p>Cashier: {order.cashier.name}</p>
          {branch && <p>Branch: {branch.name}</p>}
      </div>

      <div className="border-t border-b border-dashed border-gray-400 dark:border-gray-500 py-2 my-2">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between">
            <div className="flex-grow pr-2">
              <p>{item.name}</p>
              <p className="pl-2">
                {item.quantity} x {formatCurrency(item.price)}
              </p>
            </div>
            <p>{formatCurrency(item.quantity * item.price)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <p>Subtotal:</p>
          <p>{formatCurrency(order.subtotal)}</p>
        </div>
        <div className="flex justify-between">
          <p>Tax:</p>
          <p>{formatCurrency(order.tax)}</p>
        </div>
        <div className="flex justify-between font-bold text-base">
          <p>Total:</p>
          <p>{formatCurrency(order.total)}</p>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 dark:border-gray-500 py-2 my-2 space-y-1">
         <div className="flex justify-between">
            <p>Payment Method:</p>
            <p>{order.paymentMethod}</p>
        </div>
        {order.paymentMethod === 'Cash' && (
            <>
                <div className="flex justify-between">
                    <p>Cash Paid:</p>
                    <p>{formatCurrency(order.cashReceived ?? 0)}</p>
                </div>
                <div className="flex justify-between">
                    <p>Change:</p>
                    <p>{formatCurrency(order.changeDue ?? 0)}</p>
                </div>
            </>
        )}
      </div>
      
      <div className="text-center mt-4">
          <p>Thank you for your purchase!</p>
      </div>
    </div>
  );
};

export default Receipt;