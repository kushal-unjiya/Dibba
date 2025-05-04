import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../../components/CartItem';
import Checkout from '../../components/Checkout';
import PaymentModal from '../../components/PaymentModal';
import { useCart } from '../../contexts/CartContext'; // Import useCart hook
import { OrderDetails } from '../../components/Checkout';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart(); // Use cart context
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({ isSuccess: false, message: '' });
  const navigate = useNavigate();

  const handleQuantityChange = (mealId: string, newQuantity: number) => {
    updateQuantity(mealId, newQuantity);
  };

  const handleRemoveItem = (mealId: string) => {
    removeFromCart(mealId);
  };

  const handlePlaceOrder = async (orderDetails: OrderDetails) => {
    console.log('Placing Order:', orderDetails);
    // TODO: Call API to place order
    // Simulate API response
    const isSuccess = Math.random() > 0.2; // Simulate success/failure
    setPaymentStatus({
      isSuccess: isSuccess,
      message: isSuccess ? 'Your order has been placed successfully!' : 'Payment failed. Please try again or choose a different method.'
    });
    setShowPaymentModal(true);
    setShowCheckout(false); // Hide checkout form after attempt
    if (isSuccess) {
        clearCart(); // Clear cart if order successful
    }
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    if (paymentStatus.isSuccess) {
        // Navigate to order tracking or order history page
        navigate('/customer/tracking/123'); // Example order ID
    }
  };

  const calculatedTotal = totalAmount;
  const deliveryFee = calculatedTotal > 0 ? 30 : 0;
  const finalTotal = calculatedTotal + deliveryFee;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 mb-4">Your cart is empty.</p>
          <Link
            to="/customer/menu"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <CartItem
                key={item.mealId}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemoveItem={handleRemoveItem}
              />
            ))}
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="sticky top-6"> {/* Make summary sticky */}
              <div className="border rounded-lg p-6 bg-white shadow-md">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
                <div className="space-y-2 mb-4 text-gray-700">
                  {/* Optional: Add subtotal, delivery fee, taxes */}
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{calculatedTotal.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  disabled={showCheckout}
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-300 disabled:opacity-50"
                >
                  Proceed to Checkout
                </button>
              </div>

              {/* Checkout Form (conditionally rendered) */}
              {showCheckout && (
                <div className="mt-6">
                  <Checkout
                    cartItems={items}
                    totalAmount={finalTotal}
                    onPlaceOrder={handlePlaceOrder}
                  />
                   <button
                      onClick={() => setShowCheckout(false)}
                      className="mt-2 text-sm text-gray-600 hover:underline w-full text-center"
                    >
                      Cancel Checkout
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={closeModal}
        isSuccess={paymentStatus.isSuccess}
        message={paymentStatus.message}
      />
    </div>
  );
};

export default Cart;