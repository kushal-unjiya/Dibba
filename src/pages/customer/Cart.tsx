import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../../components/CartItem';
import Checkout from '../../components/Checkout';
import PaymentModal from '../../components/PaymentModal';
import { useCart } from '../../contexts/CartContext'; // Import useCart hook
import { OrderDetails } from '../../components/Checkout';
import { ordersAPI } from '../../services/api'; // Import ordersAPI
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart(); // Use cart context
  const { user } = useAuth(); // Get user info for customerId
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({ isSuccess: false, message: '' });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleQuantityChange = (mealId: string, newQuantity: number) => {
    updateQuantity(mealId, newQuantity);
  };

  const handleRemoveItem = (mealId: string) => {
    removeFromCart(mealId);
  };

  const handlePlaceOrder = async (orderDetails: OrderDetails) => {
    if (!user) {
      setPaymentStatus({ isSuccess: false, message: 'You must be logged in to place an order.' });
      setShowPaymentModal(true);
      return;
    }
    if (items.length === 0) {
       setPaymentStatus({ isSuccess: false, message: 'Your cart is empty.' });
       setShowPaymentModal(true);
       return;
    }

    setIsPlacingOrder(true); // Start loading
    console.log('Placing Order with details:', orderDetails);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setPaymentStatus({ isSuccess: false, message: 'Authentication error. Please log in again.' });
      setShowPaymentModal(true);
      setIsPlacingOrder(false);
      return;
    }

    // Find the homemakerId from the first item (assuming cart only contains items from one homemaker)
    // TODO: Handle carts with items from multiple homemakers if needed
    const homemakerId = items[0]?.mealDetails?.homemakerId; // Need homemakerId on mealDetails
    if (!homemakerId) {
       console.error("Could not determine homemaker for the order.");
       setPaymentStatus({ isSuccess: false, message: 'Error processing order. Could not identify the kitchen.' });
       setShowPaymentModal(true);
       setIsPlacingOrder(false);
       return;
    }


    const orderData = {
      // customerId: user.id, // Backend should get this from the token ideally, but let's pass it if needed by backend logic
      homemakerId: homemakerId,
      items: items.map(item => ({
        mealId: item.mealId,
        quantity: item.quantity,
        price: item.price, // Price per unit at the time of adding to cart
      })),
      totalAmount: finalTotal, // Use the calculated final total
      deliveryAddress: orderDetails.address,
      paymentMethod: orderDetails.paymentMethod,
      specialInstructions: orderDetails.specialInstructions,
      // Backend will set: id, customerId (from token), status, orderDate, paymentStatus, timeline
    };

    try {
      const newOrder = await ordersAPI.createOrder(orderData, token);
      console.log('Order placed successfully:', newOrder);

      setPaymentStatus({
        isSuccess: true,
        message: 'Your order has been placed successfully!'
      });
      clearCart(); // Clear cart on successful order
      setShowCheckout(false); // Hide checkout form
      setShowPaymentModal(true); // Show success modal

    } catch (error: any) {
      console.error('Failed to place order:', error);
      setPaymentStatus({
        isSuccess: false,
        message: `Failed to place order: ${error.message || 'Please try again.'}`
      });
      setShowPaymentModal(true); // Show error modal
    } finally {
      setIsPlacingOrder(false); // Stop loading
    }
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    if (paymentStatus.isSuccess) {
      // Navigate to order history or tracking page after successful order
      // The actual order ID comes from the API response (newOrder.id)
      // For now, let's navigate to a generic orders page or home
      navigate('/customer/home'); // Or '/customer/orders' if you have one
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
                    isProcessing={isPlacingOrder} // Pass loading state to Checkout
                  />
                   <button
                      onClick={() => setShowCheckout(false)}
                      disabled={isPlacingOrder} // Disable cancel while processing
                      className="mt-2 text-sm text-gray-600 hover:underline w-full text-center disabled:opacity-50"
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