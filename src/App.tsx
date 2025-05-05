import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound'; // Assuming you have a NotFound component

// Role Selection
import RoleSelector from './pages/RoleSelector';

// Authentication Pages
import CustomerAuth from './pages/CustomerAuth';
import HomemakerAuth from './pages/HomemakerAuth';
import DeliveryAuth from './pages/DeliveryAuth';

// Customer Pages
import CustomerHome from './pages/customer/Home';
import CustomerMenu from './pages/customer/Menu';
import CustomerCart from './pages/customer/Cart';
import CustomerProfile from './pages/customer/Profile';
import CustomerOrderTracking from './pages/customer/OrderTracking';

// Homemaker Pages
import HomemakerDashboard from './pages/homemaker/Dashboard';
import HomemakerMealManager from './pages/homemaker/MealManager';
import HomemakerOrderManager from './pages/homemaker/OrderManager';
import HomemakerProfile from './pages/homemaker/HomemakerProfile';
import HomemakerEarnings from './pages/homemaker/Earnings';
import HomemakerFeedback from './pages/homemaker/Feedback';

// Delivery Pages
import DeliveryDashboard from './pages/delivery/Dashboard';
import DeliveryOrderList from './pages/delivery/OrderList';
import DeliveryProfile from './pages/delivery/DeliveryProfile';
import DeliveryEarnings from './pages/delivery/Earnings';
import DeliverySupport from './pages/delivery/DeliverySupport';

// Other Pages (Example)
import Contact from './pages/Contact';

import './App.css';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16"> {/* Add padding-top to avoid overlap with fixed header */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RoleSelector />} />
          <Route path="/contact" element={<Contact />} />

          {/* Authentication Routes */}
          <Route path="/customer-auth" element={<CustomerAuth />} />
          <Route path="/homemaker-auth" element={<HomemakerAuth />} />
          <Route path="/delivery-auth" element={<DeliveryAuth />} />

          {/* Customer Routes */}
          <Route path="/customer" element={<Navigate to="/customer/home" replace />} />
          <Route path="/customer/home" element={<CustomerHome />} />
          <Route path="/customer/menu" element={<CustomerMenu />} />
          <Route
            path="/customer/cart"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerCart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders/:orderId/track"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerOrderTracking />
              </ProtectedRoute>
            }
          />

          {/* Homemaker Routes */}
          <Route
            path="/homemaker/dashboard"
            element={
              <ProtectedRoute requiredRole="homemaker">
                <HomemakerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homemaker/meals"
            element={
              <ProtectedRoute requiredRole="homemaker">
                <HomemakerMealManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homemaker/orders"
            element={
              <ProtectedRoute requiredRole="homemaker">
                <HomemakerOrderManager />
              </ProtectedRoute>
            }
          />
           <Route
            path="/homemaker/profile"
            element={
              <ProtectedRoute requiredRole="homemaker">
                <HomemakerProfile />
              </ProtectedRoute>
            }
          />
           <Route
            path="/homemaker/earnings"
            element={
              <ProtectedRoute requiredRole="homemaker">
                <HomemakerEarnings />
              </ProtectedRoute>
            }
          />
           <Route
            path="/homemaker/feedback"
            element={
              <ProtectedRoute requiredRole="homemaker">
                <HomemakerFeedback />
              </ProtectedRoute>
            }
          />

          {/* Delivery Routes */}
          <Route
            path="/delivery/dashboard"
            element={
              <ProtectedRoute requiredRole="delivery">
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/orders"
            element={
              <ProtectedRoute requiredRole="delivery">
                <DeliveryOrderList />
              </ProtectedRoute>
            }
          />
           <Route
            path="/delivery/profile"
            element={
              <ProtectedRoute requiredRole="delivery">
                <DeliveryProfile />
              </ProtectedRoute>
            }
          />
           <Route
            path="/delivery/earnings"
            element={
              <ProtectedRoute requiredRole="delivery">
                <DeliveryEarnings />
              </ProtectedRoute>
            }
          />
           <Route
            path="/delivery/support"
            element={
              <ProtectedRoute requiredRole="delivery">
                <DeliverySupport />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
