import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { PaymentMethod } from '../types';
import { formatCurrency } from '../utils/formatting';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmPayment: (details: { paymentMethod: PaymentMethod; cashReceived?: number }) => void;
  isSubmitting: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, totalAmount, onConfirmPayment, isSubmitting }) => {
  const [cashReceived, setCashReceived] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  
  // State for Credit Card form
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset all states on open
      setCashReceived('');
      setPaymentMethod('Cash');
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    }
  }, [isOpen]);

  const cashValue = parseFloat(cashReceived) || 0;
  const changeDue = useMemo(() => {
    if (paymentMethod === 'Cash' && cashValue > 0 && cashValue >= totalAmount) {
      return cashValue - totalAmount;
    }
    return 0;
  }, [cashValue, totalAmount, paymentMethod]);
  
  const isPaymentValid = useMemo(() => {
    if (paymentMethod === 'Cash') {
      return cashValue >= totalAmount;
    }
    if (paymentMethod === 'Credit Card') {
      return cardName.trim() !== '' && 
             cardNumber.replace(/\s/g, '').length === 16 && 
             /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry) &&
             /^[0-9]{3,4}$/.test(cardCvv);
    }
    return true; // Always valid for QR
  }, [paymentMethod, cashValue, totalAmount, cardName, cardNumber, cardExpiry, cardCvv]);

  const qrCodeUrl = useMemo(() => {
    if (paymentMethod === 'QR Code' && totalAmount > 0) {
      const data = encodeURIComponent(`pos-payment:total=${totalAmount.toFixed(2)}`);
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
    }
    return null;
  }, [paymentMethod, totalAmount]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPaymentValid) {
      onConfirmPayment({
        paymentMethod,
        cashReceived: paymentMethod === 'Cash' ? cashValue : undefined,
      });
    }
  };

  const paymentMethods: PaymentMethod[] = ['Cash', 'Credit Card', 'QR Code'];
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formattedValue);
  }
  
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setCardExpiry(value);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Payment">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Due</span>
            <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(totalAmount)}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-200 dark:bg-gray-900 p-1">
              {paymentMethods.map(method => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    paymentMethod === method
                      ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
          
          {paymentMethod === 'Cash' && (
            <>
              <div>
                <label htmlFor="cashReceived" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cash Received</label>
                <input
                  type="number"
                  id="cashReceived"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  required
                  min={totalAmount.toFixed(2)}
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-2xl text-gray-900 dark:text-gray-100 text-right"
                  autoFocus
                />
              </div>
              <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Change Due</span>
                <span className={`text-2xl font-bold ${isPaymentValid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formatCurrency(changeDue)}
                </span>
              </div>
            </>
          )}

          {paymentMethod === 'Credit Card' && (
            <div className="space-y-3 p-4 border rounded-lg dark:border-gray-600">
                <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cardholder Name</label>
                    <input type="text" id="cardName" value={cardName} onChange={e => setCardName(e.target.value)} className="mt-1 block w-full input-style" required />
                </div>
                <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
                    <input type="text" id="cardNumber" value={cardNumber} onChange={handleCardNumberChange} placeholder="0000 0000 0000 0000" className="mt-1 block w-full input-style" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                        <input type="text" id="cardExpiry" value={cardExpiry} onChange={handleExpiryChange} placeholder="MM/YY" className="mt-1 block w-full input-style" required />
                    </div>
                     <div>
                        <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVV</label>
                        <input type="text" id="cardCvv" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))} placeholder="123" className="mt-1 block w-full input-style" required />
                    </div>
                </div>
            </div>
          )}

          {paymentMethod === 'QR Code' && (
            <div className="text-center p-4 border rounded-lg dark:border-gray-600 flex flex-col items-center">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Scan to pay</p>
                {qrCodeUrl && <img 
                    src={qrCodeUrl} 
                    alt="QR Code for payment"
                    className="rounded-lg shadow-md"
                />}
            </div>
          )}

        </div>
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
            Cancel
          </button>
          <button type="submit" disabled={!isPaymentValid || isSubmitting} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-300 dark:disabled:bg-cyan-800 disabled:cursor-wait">
            {isSubmitting ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;