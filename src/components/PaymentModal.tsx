import React from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuccess: boolean;
  message: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, isSuccess, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'} mb-4`}>
          {isSuccess ? (
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <h3 className={`text-lg font-medium mb-2 ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
          {isSuccess ? 'Payment Successful' : 'Payment Failed'}
        </h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={onClose}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSuccess ? 'focus:ring-green-500' : 'focus:ring-red-500'
          }`}
        >
          {isSuccess ? 'Continue' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;