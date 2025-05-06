import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path
import OrderHistory from '../../components/OrderHistory'; // Adjust path
import AddressList from '../../components/AddressList'; // Adjust path
import { Order } from '../../interfaces/Order'; // Adjust path
import { Customer } from '../../interfaces/User'; // Adjust path

// Mock Data - Replace with API calls
const fetchMockOrders = (customerId: string): Promise<Order[]> => {
    console.log("Fetching mock orders for customer:", customerId);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 'ord1', customerId: customerId, homemakerId: 'hm1', items: [{ mealId: 'm1', quantity: 1, price: 150 }], totalAmount: 180, status: 'Delivered', orderDate: new Date(Date.now() - 86400000 * 2), deliveryAddress: { street: '123 Main St', city: 'Anytown', postalCode: '12345' }, paymentMethod: 'UPI', paymentStatus: 'Completed', actualDeliveryTime: new Date(Date.now() - 86400000 * 2 + 3600000) },
                { id: 'ord2', customerId: customerId, homemakerId: 'hm2', items: [{ mealId: 'm2', quantity: 2, price: 120 }], totalAmount: 270, status: 'Out for Delivery', orderDate: new Date(Date.now() - 3600000), deliveryAddress: { street: '456 Oak Ave', city: 'Otherville', postalCode: '67890' }, paymentMethod: 'COD', paymentStatus: 'Pending', estimatedDeliveryTime: new Date(Date.now() + 1800000) },
                { id: 'ord3', customerId: customerId, homemakerId: 'hm1', items: [{ mealId: 'm3', quantity: 1, price: 180 }], totalAmount: 210, status: 'Cancelled', orderDate: new Date(Date.now() - 86400000), deliveryAddress: { street: '123 Main St', city: 'Anytown', postalCode: '12345' }, paymentMethod: 'Card', paymentStatus: 'Failed' },
            ]);
        }, 700);
    });
};

const fetchMockCustomerDetails = (customerId: string): Promise<Partial<Customer>> => {
     console.log("Fetching mock customer details:", customerId);
     return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                name: 'Test Customer',
                email: 'customer@example.com',
                phone: '9876543210',
                addresses: ['123 Main St, Anytown', '456 Oak Ave, Otherville'], // Example addresses
            });
        }, 300);
     });
};


const Profile: React.FC = () => {
  const { user, logout } = useAuth(); // Assuming user object contains customer details or ID
  const [customerDetails, setCustomerDetails] = useState<Partial<Customer>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

  useEffect(() => {
    if (user?.id && user.role === 'customer') {
      setIsLoadingProfile(true);
      fetchMockCustomerDetails(user.id)
        .then(details => setCustomerDetails(details))
        .catch(err => console.error("Failed to load profile", err))
        .finally(() => setIsLoadingProfile(false));

      setIsLoadingOrders(true);
      fetchMockOrders(user.id)
        .then(data => setOrders(data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()))) // Sort newest first
        .catch(err => console.error("Failed to load orders", err))
        .finally(() => setIsLoadingOrders(false));
    } else {
        // Handle case where user is not logged in or not a customer
        setIsLoadingOrders(false);
        setIsLoadingProfile(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    // Navigate to login or home page might happen automatically via AuthContext/ProtectedRoute
  };

  if (!user || user.role !== 'customer') {
      return <div className="container mx-auto p-6 text-center">Please log in as a customer to view your profile.</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-grow p-6">
        <div className="max-w-7xl mx-auto md:flex md:space-x-6">
          {/* Sidebar/Navigation for Profile Sections */}
          <aside className="w-full md:w-1/4 mb-6 md:mb-0">
            <div className="bg-white p-4 rounded-lg shadow sticky top-6">
              {isLoadingProfile ? <p>Loading...</p> : (
                <div className="text-center mb-4">
                  <img src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${customerDetails.name || user.email}&background=random`} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-2 border-2 border-amber-300"/>
                  <h2 className="text-xl font-semibold">{customerDetails.name}</h2>
                  <p className="text-sm text-gray-500">{customerDetails.email}</p>
                  <p className="text-sm text-gray-500">{customerDetails.phone}</p>
                </div>
              )}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 py-2 rounded ${activeTab === 'profile' ? 'bg-amber-100 text-amber-800 font-medium' : 'hover:bg-gray-100'}`}
                >
                  Profile Details
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-3 py-2 rounded ${activeTab === 'orders' ? 'bg-amber-100 text-amber-800 font-medium' : 'hover:bg-gray-100'}`}
                >
                  Order History
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-3 py-2 rounded ${activeTab === 'addresses' ? 'bg-amber-100 text-amber-800 font-medium' : 'hover:bg-gray-100'}`}
                >
                  Manage Addresses
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="w-full md:w-3/4">
            <div className="bg-white p-6 rounded-lg shadow min-h-[300px]">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Profile Details</h2>
                  {isLoadingProfile ? <p>Loading details...</p> : (
                    <div className="space-y-3">
                      <p><strong>Name:</strong> {customerDetails.name}</p>
                      <p><strong>Email:</strong> {customerDetails.email}</p>
                      <p><strong>Phone:</strong> {customerDetails.phone}</p>
                      {/* Add form to edit details */}
                      <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm">Edit Profile</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Order History</h2>
                  <OrderHistory orders={orders} isLoading={isLoadingOrders} />
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Manage Addresses</h2>
                  {isLoadingProfile ? <p>Loading addresses...</p> : (
                    <AddressList /> // Pass addresses and handlers from customerDetails if needed
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;