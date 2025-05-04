import React, { useState } from 'react';
import { OrderItem } from '../interfaces/Order'; // Assuming OrderItem includes meal details or you fetch them

interface CheckoutProps {
  cartItems: OrderItem[];
  totalAmount: number;
  onPlaceOrder: (orderDetails: any) => void; // Define a proper type for orderDetails
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalAmount, onPlaceOrder }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD' | 'Card'>('COD');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !phone || cartItems.length === 0) {
      alert('Please fill all details and ensure cart is not empty.');
      return;
    }
    const orderDetails = {
      customerDetails: { name, address, phone },
      items: cartItems,
      totalAmount,
      paymentMethod,
      // Add other necessary details like delivery instructions etc.
    };
    onPlaceOrder(orderDetails);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'UPI' | 'COD' | 'Card')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500">
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="UPI">UPI</option>
            <option value="Card">Credit/Debit Card (Mock)</option>
          </select>
        </div>
        <div className="text-right font-semibold text-xl">
          Total: ₹{totalAmount.toFixed(2)}
        </div>
        <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;