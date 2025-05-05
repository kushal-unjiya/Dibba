import React, { useState } from 'react';
import { Address, OrderItem, PaymentMethod } from '../interfaces/Order'; // Assuming interfaces are here or imported

export interface OrderDetails {
  address: Address;
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
}

interface CheckoutProps {
  cartItems: OrderItem[];
  totalAmount: number;
  onPlaceOrder: (orderDetails: OrderDetails) => void;
  isProcessing?: boolean; // Add isProcessing prop
}

const Checkout: React.FC<CheckoutProps> = ({
  cartItems, // Keep if needed for display, otherwise remove
  totalAmount,
  onPlaceOrder,
  isProcessing = false // Default to false
}) => {
  const [address, setAddress] = useState<Address>({ street: '', city: '', postalCode: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof Address | 'form', string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Address | 'form', string>> = {};
    if (!address.street.trim()) newErrors.street = 'Street address is required.';
    if (!address.city.trim()) newErrors.city = 'City is required.';
    if (!address.postalCode.trim()) newErrors.postalCode = 'Postal code is required.';
    // Add more validation as needed (e.g., postal code format)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onPlaceOrder({
        address,
        paymentMethod,
        specialInstructions
      });
    } else {
      setErrors(prev => ({ ...prev, form: 'Please fill in all required fields.' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg bg-gray-50 shadow">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">Delivery Details</h3>

      {errors.form && <p className="text-sm text-red-600 mb-2">{errors.form}</p>}

      {/* Address Fields */}
      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
        <input
          type="text"
          id="street"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          disabled={isProcessing} // Disable when processing
          className={`mt-1 block w-full rounded-md border ${errors.street ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-amber-500 focus:ring-amber-500 disabled:bg-gray-100`}
        />
        {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
        <input
          type="text"
          id="city"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border ${errors.city ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-amber-500 focus:ring-amber-500 disabled:bg-gray-100`}
        />
        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
      </div>
      <div>
        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
        <input
          type="text"
          id="postalCode"
          value={address.postalCode}
          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-amber-500 focus:ring-amber-500 disabled:bg-gray-100`}
        />
        {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          disabled={isProcessing} // Disable when processing
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 disabled:bg-gray-100"
        >
          <option value="COD">Cash on Delivery (COD)</option>
          <option value="UPI">UPI</option>
          <option value="Card">Credit/Debit Card</option>
        </select>
      </div>

      {/* Special Instructions */}
      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Special Instructions (Optional)</label>
        <textarea
          id="instructions"
          rows={2}
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          disabled={isProcessing} // Disable when processing
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 disabled:bg-gray-100"
          placeholder="e.g., Avoid onions, call upon arrival"
        />
      </div>

      {/* Total Amount Display */}
      <div className="text-lg font-semibold border-t pt-4 mt-4">
        Total: ₹{totalAmount.toFixed(2)}
      </div>

      {/* Place Order Button */}
      <button
        type="submit"
        disabled={isProcessing} // Disable when processing
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Placing Order...' : `Place Order (${paymentMethod})`}
      </button>
    </form>
  );
};

export default Checkout;