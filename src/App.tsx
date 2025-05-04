import './App.css'
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/customer/Home';
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import RoleSelector from './pages/RoleSelector';
import NotFound from './components/NotFound'; // Import NotFound
import HomemakerAuth from './pages/HomemakerAuth';
import DeliveryAuth from './pages/DeliveryAuth';
import HomemakerDashboard from './pages/homemaker/Dashboard';
import MealManager from './pages/homemaker/MealManager';
import OrderManager from './pages/homemaker/OrderManager';
import HomemakerProfile from './pages/homemaker/HomemakerProfile';
import HomemakerEarnings from './pages/homemaker/Earnings';
import Feedback from './pages/homemaker/Feedback';
import DeliveryDashboard from './pages/delivery/Dashboard';
import DeliveryOrderList from './pages/delivery/OrderList';
import DeliveryProfile from './pages/delivery/DeliveryProfile';
import DeliveryEarnings from './pages/delivery/Earnings';
import DeliverySupport from './pages/delivery/DeliverySupport';
import OrderTracking from './pages/customer/OrderTracking';
// TODO: Import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Basic layout structure
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RoleSelector />} />
          <Route path="/homemaker-auth" element={<HomemakerAuth />} />
          <Route path="/delivery-auth" element={<DeliveryAuth />} />
          {/* <Route path="/contact" element={<Contact />} /> */}

          {/* Customer Routes */}
          <Route path="/customer/home" element={<Home />} />
          <Route path="/customer/menu" element={<Menu />} />
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/customer/tracking/:orderId" element={<OrderTracking />} />
          {/* <Route path="/customer/profile" element={<CustomerProfile />} /> */}

          {/* Homemaker Routes */}
          <Route path="/homemaker/dashboard" element={<HomemakerDashboard />} />
          <Route path="/homemaker/meals" element={<MealManager />} />
          <Route path="/homemaker/orders" element={<OrderManager />} />
          <Route path="/homemaker/profile" element={<HomemakerProfile />} />
          <Route path="/homemaker/earnings" element={<HomemakerEarnings />} />
          <Route path="/homemaker/feedback" element={<Feedback />} />

          {/* Delivery Partner Routes */}
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          <Route path="/delivery/orders" element={<DeliveryOrderList />} />
          <Route path="/delivery/profile" element={<DeliveryProfile />} />
          <Route path="/delivery/earnings" element={<DeliveryEarnings />} />
          <Route path="/delivery/support" element={<DeliverySupport />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
export default App;
