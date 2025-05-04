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
        <h3 className={`text-lg leading-6 font-medium ${isSuccess ? 'text-green-900' : 'text-red-900'}`}>
          {isSuccess ? 'Payment Successful' : 'Payment Failed'}
        </h3>
        <div className="mt-2 px-7 py-3">
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="items-center px-4 py-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;