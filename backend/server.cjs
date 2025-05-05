const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url'); // Import the 'url' module

// Read database file
const dbPath = path.join(__dirname, 'db.json');

// Load permanent data
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Enable CORS middleware (Updated)
function setCorsHeaders(res, origin) {
  // Allow specific origin instead of wildcard
  res.setHeader('Access-Control-Allow-Origin', origin || 'http://localhost:3000');
  // Add PATCH to the allowed methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Save database function
function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function sendJsonResponse(res, statusCode, body) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function generateId(resource) {
  const collection = db[resource] || [];
  const lastId = collection.length > 0 ? 
    parseInt(collection[collection.length - 1].id.replace(/\D/g, '')) : 0;
  const prefix = resource.charAt(0);
  return `${prefix}${lastId + 1}`;
}

// Cart handling middleware
const handleCartRequest = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendJsonResponse(res, 401, { message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(' ')[1];
  const [userId, role] = token.split('-');

  if (role !== 'customer') {
    sendJsonResponse(res, 403, { message: "Only customers can access cart" });
    return;
  }

  // Handle cart operations
  if (req.method === 'GET') {
    const cart = db.carts?.find(c => c.userId === userId) || { userId, items: [] };
    sendJsonResponse(res, 200, cart);
    return;
  }

  if (req.method === 'POST') {
    const cartIndex = db.carts?.findIndex(c => c.userId === userId) ?? -1;
    const cart = cartIndex >= 0 ? db.carts[cartIndex] : { userId, items: [] };
    
    const newItem = req.body;
    const existingItemIndex = cart.items.findIndex(item => item.mealId === newItem.mealId);
    
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += newItem.quantity;
    } else {
      cart.items.push(newItem);
    }

    if (cartIndex >= 0) {
      db.carts[cartIndex] = cart;
    } else {
      if (!db.carts) db.carts = [];
      db.carts.push(cart);
    }
    
    saveDb();
    sendJsonResponse(res, 200, cart);
    return;
  }

  if (req.method === 'DELETE') {
    const cartIndex = db.carts?.findIndex(c => c.userId === userId) ?? -1;
    if (cartIndex >= 0) {
      const mealId = req.url.split('/').pop();
      const cart = db.carts[cartIndex];
      cart.items = cart.items.filter(item => item.mealId !== mealId);
      saveDb();
      sendJsonResponse(res, 200, cart);
    } else {
      sendJsonResponse(res, 404, { message: "Cart not found" });
    }
    return;
  }

  sendJsonResponse(res, 405, { message: "Method not allowed" });
};

// Delivery order handling middleware
const handleDeliveryOrderRequest = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendJsonResponse(res, 401, { message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(' ')[1];
  const [userId, role] = token.split('-');

  if (role !== 'delivery') {
    sendJsonResponse(res, 403, { message: "Only delivery partners can access these orders" });
    return;
  // Handle available orders (Updated)
  } else if (req.method === 'GET' && req.url.endsWith('/available')) {
    const availableOrdersRaw = db.orders?.filter(o =>
      o.status === 'Ready for Pickup' && !o.deliveryPartnerId
    ) || [];

    // Enrich orders with pickup address and customer contact
    const availableOrdersEnriched = availableOrdersRaw.map(order => {
      const homemaker = db.users?.find(u => u.id === order.homemakerId && u.role === 'homemaker');
      const customer = db.users?.find(u => u.id === order.customerId && u.role === 'customer');

      // Construct the DeliveryOrder structure
      return {
        ...order, // Spread the original order data
        pickupAddress: homemaker?.address || { street: 'N/A', city: 'N/A', postalCode: 'N/A' }, // Get homemaker address
        customerContact: { // Get customer contact details
          name: customer?.name || 'N/A',
          phone: customer?.phone || 'N/A', // Assuming phone exists on user object
        },
        // Add other fields expected by DeliveryOrder if needed (e.g., earnings calculation)
        earnings: { // Example earnings structure
          baseAmount: 50, // Placeholder
          incentives: 0, // Placeholder
          total: 50 // Placeholder
        }
      };
    });

    sendJsonResponse(res, 200, availableOrdersEnriched); // Send enriched data
    return;
  }

  // Handle current order (Updated)
  else if (req.method === 'GET' && req.url.endsWith('/current')) {
    const currentOrderRaw = db.orders?.find(o =>
      o.deliveryPartnerId === userId &&
      ['Out for Delivery'].includes(o.status) // Only 'Out for Delivery' is current
    );

    if (currentOrderRaw) {
        const homemaker = db.users?.find(u => u.id === currentOrderRaw.homemakerId && u.role === 'homemaker');
        const customer = db.users?.find(u => u.id === currentOrderRaw.customerId && u.role === 'customer');

        const currentOrderEnriched = {
            ...currentOrderRaw,
            pickupAddress: homemaker?.address || { street: 'N/A', city: 'N/A', postalCode: 'N/A' },
            customerContact: {
              name: customer?.name || 'N/A',
              phone: customer?.phone || 'N/A',
            },
             earnings: { // Example earnings structure
              baseAmount: 50, // Placeholder
              incentives: 0, // Placeholder
              total: 50 // Placeholder
            }
        };
         sendJsonResponse(res, 200, currentOrderEnriched);
    } else {
        sendJsonResponse(res, 200, null); // Send null if no current order
    }
    return;
  }

  // Handle delivery status update (POST /api/delivery/orders/:orderId/status)
  else if (req.method === 'POST' && req.url.includes('/status')) {
    const orderId = req.url.split('/').slice(-2)[0];
    const { status } = req.body;
    
    const orderIndex = db.orders?.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      sendJsonResponse(res, 404, { message: "Order not found" });
      return;
    }

    const order = db.orders[orderIndex];
    if (order.deliveryPartnerId && order.deliveryPartnerId !== userId) {
      sendJsonResponse(res, 403, { message: "Not authorized to update this order" });
      return;
    }

    // Update order status and assign delivery partner
    db.orders[orderIndex] = {
      ...order,
      status,
      deliveryPartnerId: userId,
      deliveryStartTime: status === 'Out for Delivery' ? new Date().toISOString() : order.deliveryStartTime
    };
    
    saveDb();
    sendJsonResponse(res, 200, db.orders[orderIndex]);
    return;
  }

  sendJsonResponse(res, 405, { message: "Method not allowed for delivery orders" });
};

// Calculate earnings helper
function calculateEarnings(orders, userId, role, startDate, endDate) {
  return orders
    .filter(o => {
      const orderDate = new Date(o.orderDate);
      const matchesUser = role === 'delivery' ? 
        o.deliveryPartnerId === userId : 
        o.homemakerId === userId;
      
      return orderDate >= startDate && 
             orderDate <= endDate && 
             o.status === 'Delivered' &&
             matchesUser;
    })
    .reduce((acc, order) => {
      let earnings = 0;
      
      if (role === 'delivery') {
        // Delivery partner earnings calculation
        const baseAmount = 30; // Base delivery fee
        const distanceCharge = order.route?.distance ? order.route.distance * 10 : 0; // ₹10 per km
        earnings = baseAmount + distanceCharge;
      } else if (role === 'homemaker') {
        // Homemaker earnings calculation
        const platformFee = 0.10; // 10% platform fee
        const itemTotal = order.items.reduce((sum, item) => {
          const meal = db.meals?.find(m => m.id === item.mealId);
          return sum + (meal?.price || 0) * item.quantity;
        }, 0);
        earnings = itemTotal * (1 - platformFee);
      }

      return {
        orders: acc.orders + 1,
        amount: acc.amount + earnings
      };
    }, { orders: 0, amount: 0 });
}

// Earnings middleware
const handleEarningsRequest = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendJsonResponse(res, 401, { message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(' ')[1];
  const [userId, role] = token.split('-');

  if (!['delivery', 'homemaker'].includes(role)) {
    sendJsonResponse(res, 403, { message: "Access denied" });
    return;
  }

  // Get earnings summary
  if (req.method === 'GET' && req.url.endsWith('/summary')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEarnings = calculateEarnings(db.orders || [], userId, role, today, new Date());
    const totalEarnings = calculateEarnings(db.orders || [], userId, role, new Date(0), new Date());
    
    const pendingPayout = totalEarnings.amount - 
      (db.payouts?.filter(p => p.userId === userId)
        .reduce((sum, p) => sum + p.amount, 0) || 0);

    const lastPayout = db.payouts?.filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    sendJsonResponse(res, 200, {
      totalEarnings: totalEarnings.amount,
      pendingPayout,
      lastPayoutDate: lastPayout?.date,
      todayStats: {
        orders: todayEarnings.orders,
        earnings: todayEarnings.amount
      }
    });
    return;
  }

  // Get earnings history
  if (req.method === 'GET' && req.url.endsWith('/history')) {
    const days = 30; // Get last 30 days
    const history = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const dayEarnings = calculateEarnings(db.orders || [], userId, role, date, endDate);
      if (dayEarnings.orders > 0) {
        history.push({
          date: date.toISOString().split('T')[0],
          orders: dayEarnings.orders,
          amount: dayEarnings.amount
        });
      }
    }

    sendJsonResponse(res, 200, history);
    return;
  }

  // Get chart data
  if (req.method === 'GET' && req.url.endsWith('/chart')) {
    const days = 7; // Last 7 days
    const chartData = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const dayEarnings = calculateEarnings(db.orders || [], userId, role, date, endDate);
      chartData.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        earnings: dayEarnings.amount,
        orders: dayEarnings.orders
      });
    }

    sendJsonResponse(res, 200, chartData.reverse());
    return;
  }

  sendJsonResponse(res, 404, { message: "Endpoint not found" });
};

// User profile handling middleware
const handleUserProfileRequest = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendJsonResponse(res, 401, { message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(' ')[1];
  const [userId, role] = token.split('-');

  // Get current user profile
  if (req.method === 'GET' && req.url.endsWith('/me')) {
    const user = db.users?.find(u => u.id === userId);
    if (user) {
      const { password, ...userWithoutPassword } = user;

      // Get role-specific data
      let roleData = {};
      if (role === 'delivery') {
        const deliveryStats = calculateDeliveryStats(userId);
        roleData = {
          stats: deliveryStats,
          currentLocation: user.currentLocation,
          vehicleDetails: user.vehicleDetails,
          bankDetails: user.bankDetails,
          isAvailable: user.isAvailable
        };
      } else if (role === 'homemaker') {
        const homemakerStats = calculateHomemakerStats(userId);
        roleData = {
          stats: homemakerStats,
          kitchenDetails: user.kitchenDetails,
          bankDetails: user.bankDetails,
          schedule: user.schedule,
          isActive: user.isActive
        };
      }

      sendJsonResponse(res, 200, {
        ...userWithoutPassword,
        ...roleData
      });
    } else {
      sendJsonResponse(res, 404, { message: "User not found" });
    }
    return;
  }

  // Update user profile
  if (req.method === 'PATCH' && req.url.includes('/users/')) {
    const userIndex = db.users?.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      sendJsonResponse(res, 404, { message: "User not found" });
      return;
    }

    // Update user data
    const updatedUser = {
      ...db.users[userIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    db.users[userIndex] = updatedUser;
    saveDb();

    const { password, ...userWithoutPassword } = updatedUser;
    sendJsonResponse(res, 200, userWithoutPassword);
    return;
  }

  sendJsonResponse(res, 405, { message: "Method not allowed" });
};

// Helper function to calculate delivery partner stats
function calculateDeliveryStats(userId) {
  const userOrders = db.orders?.filter(o => o.deliveryPartnerId === userId) || [];
  const completedOrders = userOrders.filter(o => o.status === 'Delivered');
  const cancelledOrders = userOrders.filter(o => o.status === 'Cancelled');
  
  const totalEarnings = completedOrders.reduce((sum, order) => {
    const baseAmount = 30; // Base delivery fee
    const distanceCharge = order.route?.distance ? order.route.distance * 10 : 0;
    return sum + baseAmount + distanceCharge;
  }, 0);

  const avgRating = completedOrders.length > 0 
    ? completedOrders.reduce((sum, o) => sum + (o.deliveryRating || 0), 0) / completedOrders.length 
    : 0;

  // Calculate average delivery time and on-time rate
  const deliveryTimes = completedOrders
    .filter(o => o.deliveryStartTime && o.deliveryDate)
    .map(o => {
      const startTime = new Date(o.deliveryStartTime);
      const endTime = new Date(o.deliveryDate);
      return (endTime.getTime() - startTime.getTime()) / (1000 * 60); // Convert to minutes
    });

  const avgDeliveryTime = deliveryTimes.length > 0
    ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
    : 0;

  // Consider a delivery "on time" if completed within 45 minutes
  const onTimeDeliveries = deliveryTimes.filter(time => time <= 45).length;
  const onTimeDeliveryRate = deliveryTimes.length > 0
    ? (onTimeDeliveries / deliveryTimes.length) * 100
    : 0;

  return {
    totalDeliveries: userOrders.length,
    completedDeliveries: completedOrders.length,
    cancelledDeliveries: cancelledOrders.length,
    totalEarnings,
    avgRating,
    avgDeliveryTime,
    onTimeDeliveryRate
  };
}

// Helper function to calculate homemaker stats
function calculateHomemakerStats(userId) {
  const userOrders = db.orders?.filter(o => o.homemakerId === userId) || [];
  const completedOrders = userOrders.filter(o => o.status === 'Delivered');
  const cancelledOrders = userOrders.filter(o => o.status === 'Cancelled');
  
  const totalEarnings = completedOrders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0), 0);

  const ratings = completedOrders
    .filter(o => o.rating)
    .map(o => ({
      overall: o.rating,
      taste: o.ratingDetails?.taste || o.rating,
      packaging: o.ratingDetails?.packaging || o.rating,
      value: o.ratingDetails?.value || o.rating
    }));

  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.overall, 0) / ratings.length
    : 0;

  return {
    totalOrders: userOrders.length,
    completedOrders: completedOrders.length,
    cancelledOrders: cancelledOrders.length,
    totalEarnings,
    avgRating,
    activeMenuItems: db.meals?.filter(m => m.homemakerId === userId && m.isAvailable).length || 0
  };
}

// Meal management middleware
const handleMealRequest = (req, res) => {
  const authHeader = req.headers.authorization;
  // Allow public GET requests without strict auth check, but still parse token if present for potential future use
  let userId, role;
  if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      [userId, role] = token.split('-');
      console.log(`[Meal Request] Auth Token Parsed: UserID=${userId}, Role=${role}`); // Added log
  } else {
      console.log('[Meal Request] No valid auth token found in headers.'); // Added log
  }


  // GET meals (public endpoint, no auth required for basic GET)
  if (req.method === 'GET') {
    let meals = db.meals || [];
    const { homemakerId, category, dietary, isAvailable, q } = req.query; // Added 'q' for search

    // Apply filters
    if (homemakerId) {
      meals = meals.filter(m => m.homemakerId === homemakerId);
    }
    if (category) {
      meals = meals.filter(m => m.category === category);
    }
    if (dietary) {
      meals = meals.filter(m => m.dietary === dietary);
    }
    if (isAvailable !== undefined) {
      meals = meals.filter(m => m.isAvailable === (isAvailable === 'true'));
    }
    // Basic text search filter (searches name and description)
    if (q) {
        const queryLower = q.toLowerCase();
        meals = meals.filter(m =>
            m.name.toLowerCase().includes(queryLower) ||
            (m.description && m.description.toLowerCase().includes(queryLower))
        );
    }


    // Enrich with homemaker details
    meals = meals.map(meal => {
      const homemaker = db.users.find(u => u.id === meal.homemakerId);
      return {
        ...meal,
        homemakerName: homemaker?.name || 'Unknown'
      };
    });

    sendJsonResponse(res, 200, meals);
    return;
  }

  // --- Modification/Deletion requires Auth and Homemaker Role ---
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[Meal Request] Unauthorized: Missing or invalid token'); // Added log
    sendJsonResponse(res, 401, { message: "Unauthorized: Missing or invalid token" });
    return;
  }
  if (role !== 'homemaker') {
    console.error(`[Meal Request] Forbidden: Role '${role}' is not 'homemaker'`); // Added log
    sendJsonResponse(res, 403, { message: "Forbidden: Only homemakers can manage meals" });
    return;
  }
  // --- End Auth Check ---


  // POST new meal
  if (req.method === 'POST') {
    console.log('[Meal Request POST] Received body:', JSON.stringify(req.body, null, 2)); // Added log
    const mealData = {
      id: generateId('meals'),
      ...req.body,
      homemakerId: userId, // Ensure meal is linked to the authenticated homemaker
      rating: 0,
      createdAt: new Date().toISOString(),
      reviewCount: 0
    };
    console.log('[Meal Request POST] Saving meal data:', JSON.stringify(mealData, null, 2)); // Added log

    if (!db.meals) db.meals = [];
    db.meals.push(mealData);
    try {
      saveDb();
      console.log('[Meal Request POST] Meal saved successfully.'); // Added log
      sendJsonResponse(res, 201, mealData);
    } catch (saveError) {
      console.error('[Meal Request POST] Error saving DB:', saveError); // Added log
      sendJsonResponse(res, 500, { message: "Internal server error while saving meal." });
    }
    return;
  }

  // PATCH update meal
  if (req.method === 'PATCH') {
    const mealId = req.url.split('/').pop(); // Assuming URL like /api/meals/{mealId}
    const mealIndex = db.meals?.findIndex(m => m.id === mealId);

    if (mealIndex === -1) {
      sendJsonResponse(res, 404, { message: "Meal not found" });
      return;
    }

    const meal = db.meals[mealIndex];
    // Verify the meal belongs to the authenticated homemaker
    if (meal.homemakerId !== userId) {
      sendJsonResponse(res, 403, { message: "Forbidden: Not authorized to update this meal" });
      return;
    }

    const updatedMeal = {
      ...meal,
      ...req.body,
      homemakerId: userId, // Ensure homemakerId cannot be changed
      id: mealId // Ensure ID cannot be changed
    };

    db.meals[mealIndex] = updatedMeal;
    saveDb();
    sendJsonResponse(res, 200, updatedMeal);
    return;
  }

  // DELETE meal
  if (req.method === 'DELETE') {
    const mealId = req.url.split('/').pop(); // Assuming URL like /api/meals/{mealId}
    const mealIndex = db.meals?.findIndex(m => m.id === mealId);

    if (mealIndex === -1) {
      sendJsonResponse(res, 404, { message: "Meal not found" });
      return;
    }

    const meal = db.meals[mealIndex];
    // Verify the meal belongs to the authenticated homemaker
    if (meal.homemakerId !== userId) {
      sendJsonResponse(res, 403, { message: "Forbidden: Not authorized to delete this meal" });
      return;
    }

    db.meals.splice(mealIndex, 1);
    saveDb();
    sendJsonResponse(res, 200, { message: "Meal deleted successfully" });
    return;
  }

  sendJsonResponse(res, 405, { message: "Method not allowed for meals" });
};


// Order management middleware (Updated signature)
const handleOrderRequest = (req, res, orderId) => { // Added orderId parameter
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendJsonResponse(res, 401, { message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(' ')[1];
  const [userId, role] = token.split('-');

  // GET orders
  if (req.method === 'GET') {
    let orders = db.orders || [];
    const { status, customerId, homemakerId, deliveryPartnerId } = req.query;

    // Filter based on user role and query params
    switch (role) {
      case 'customer':
        orders = orders.filter(o => o.customerId === userId);
        break;
      case 'homemaker':
        orders = orders.filter(o => o.homemakerId === userId);
        break;
      case 'delivery':
        orders = orders.filter(o => o.deliveryPartnerId === userId || !o.deliveryPartnerId);
        break;
      default:
        sendJsonResponse(res, 403, { message: "Invalid role" });
        return;
    }

    // Apply additional filters
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (customerId) {
      orders = orders.filter(o => o.customerId === customerId);
    }
    if (homemakerId) {
      orders = orders.filter(o => o.homemakerId === homemakerId);
    }
    if (deliveryPartnerId) {
      orders = orders.filter(o => o.deliveryPartnerId === deliveryPartnerId);
    }

    // Enrich order data with user details
    orders = orders.map(order => {
      const customer = db.users.find(u => u.id === order.customerId);
      const homemaker = db.users.find(u => u.id === order.homemakerId);
      const delivery = db.users.find(u => u.id === order.deliveryPartnerId);

      return {
        ...order,
        customerName: customer?.name,
        homemakerName: homemaker?.name,
        deliveryPartnerName: delivery?.name
      };
    });

    sendJsonResponse(res, 200, orders);
    return;
  }

  // POST new order (customers only)
  if (req.method === 'POST' && role === 'customer') {
    const orderData = {
      id: generateId('orders'),
      ...req.body,
      customerId: userId,
      status: 'Pending Confirmation',
      orderDate: new Date().toISOString(),
      paymentStatus: req.body.paymentMethod === 'COD' ? 'Pending' : 'Completed',
      timeline: [{
        status: 'Pending Confirmation',
        timestamp: new Date().toISOString()
      }]
    };

    if (!db.orders) db.orders = [];
    db.orders.push(orderData);

    // Clear customer's cart after successful order
    const cartIndex = db.carts?.findIndex(c => c.userId === userId);
    if (cartIndex !== -1) {
      db.carts[cartIndex].items = [];
    }

    saveDb();
    sendJsonResponse(res, 201, orderData);
    return;
  }

  // Handle order status updates
  if (req.method === 'PATCH' && req.body.status) {
    if (!orderId) { // Check if orderId was passed
        sendJsonResponse(res, 400, { message: "Order ID missing in URL path" });
        return;
    }
    const orderIndex = db.orders?.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      sendJsonResponse(res, 404, { message: "Order not found" });
      return;
    }

    const order = db.orders[orderIndex];
    const newStatus = req.body.status;

    // Validate status update based on role
    let isValidUpdate = false;
    switch (role) {
      case 'homemaker':
        isValidUpdate = order.homemakerId === userId &&
          ['Confirmed', 'Preparing', 'Ready for Pickup', 'Cancelled'].includes(newStatus);
        break;
      case 'delivery':
        isValidUpdate = (order.deliveryPartnerId === userId || !order.deliveryPartnerId) &&
          ['Out for Delivery', 'Delivered'].includes(newStatus);
        break;
      case 'customer':
        isValidUpdate = order.customerId === userId &&
          ['Cancelled'].includes(newStatus);
        break;
    }

    if (!isValidUpdate) {
      sendJsonResponse(res, 403, { message: "Not authorized to update this order status" });
      return;
    }

    // Update order
    const updatedOrder = {
      ...order,
      status: newStatus,
      deliveryPartnerId: role === 'delivery' && !order.deliveryPartnerId ? userId : order.deliveryPartnerId,
      timeline: [...order.timeline, {
        status: newStatus,
        timestamp: new Date().toISOString()
      }]
    };

    if (newStatus === 'Delivered') {
      updatedOrder.deliveryDate = new Date().toISOString();
    }

    db.orders[orderIndex] = updatedOrder;
    saveDb();
    sendJsonResponse(res, 200, updatedOrder);
    return;
  }

  sendJsonResponse(res, 405, { message: "Method not allowed" });
};

// Payout record handling middleware
const handlePayoutRequest = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendJsonResponse(res, 401, { message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(' ')[1];
  const [userId, role] = token.split('-');

  if (!['delivery', 'homemaker'].includes(role)) {
    sendJsonResponse(res, 403, { message: "Access denied" });
    return;
  }

  // Get payout history
  if (req.method === 'GET') {
    const payouts = db.payouts?.filter(p => p.userId === userId) || [];
    sendJsonResponse(res, 200, payouts.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
    return;
  }

  // Request payout (user initiated)
  if (req.method === 'POST') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalEarnings = calculateEarnings(db.orders || [], userId, role, new Date(0), new Date());
    const previousPayouts = (db.payouts?.filter(p => p.userId === userId) || [])
      .reduce((sum, p) => sum + p.amount, 0);
    
    const pendingAmount = totalEarnings.amount - previousPayouts;
    
    if (pendingAmount < 500) { // Minimum payout threshold ₹500
      sendJsonResponse(res, 400, { 
        message: "Minimum payout threshold not met. Need at least ₹500 in pending earnings." 
      });
      return;
    }

    const lastPayout = db.payouts?.filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
    if (lastPayout && 
        (new Date().getTime() - new Date(lastPayout.date).getTime()) < (7 * 24 * 60 * 60 * 1000)) {
      sendJsonResponse(res, 400, { 
        message: "Must wait 7 days between payout requests" 
      });
      return;
    }

    const payoutRecord = {
      id: generateId('payouts'),
      userId,
      role,
      amount: pendingAmount,
      status: 'Processing',
      date: new Date().toISOString(),
      processedDate: null,
      bankDetails: req.body.bankDetails
    };

    if (!db.payouts) db.payouts = [];
    db.payouts.push(payoutRecord);
    saveDb();

    sendJsonResponse(res, 201, payoutRecord);
    return;
  }

  sendJsonResponse(res, 405, { message: "Method not allowed" });
};

// --- Authentication Handlers ---

// Login Handler
function handleLogin(req, res) {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return sendJsonResponse(res, 400, { message: "Email, password, and role are required" });
  }

  const user = db.users?.find(u => u.email === email && u.role === role);

  // IMPORTANT: Plain text password comparison - NOT secure for production!
  if (user && user.password === password) {
    const { password: _, ...userWithoutPassword } = user;
    // Simple token generation (userId-role) - NOT secure JWT
    const token = `${user.id}-${user.role}`;
    sendJsonResponse(res, 200, { user: userWithoutPassword, token });
  } else {
    sendJsonResponse(res, 401, { message: "Invalid credentials or role mismatch" });
  }
}

// Registration Handler
function handleRegister(req, res) {
  const { email, password, name, role, ...otherData } = req.body;

  if (!email || !password || !name || !role) {
    return sendJsonResponse(res, 400, { message: "Email, password, name, and role are required" });
  }

  // Validate role
  if (!['customer', 'homemaker', 'delivery'].includes(role)) {
    return sendJsonResponse(res, 400, { message: "Invalid role specified" });
  }

  // Check if user already exists
  if (db.users?.some(u => u.email === email)) {
    return sendJsonResponse(res, 400, { message: "User with this email already exists" });
  }

  // Create new user
  const newUser = {
    id: generateId('users'), // Use the existing generateId function
    email,
    password, // IMPORTANT: Storing plain text password - NOT secure!
    name,
    role,
    createdAt: new Date().toISOString(),
    ...otherData // Include any other relevant data from registration (phone, address etc.)
  };

  // Add role-specific defaults if needed
  if (role === 'delivery') {
    newUser.isAvailable = true; // Default availability
    // Initialize empty vehicle/bank details if not provided
    if (!newUser.vehicleDetails) newUser.vehicleDetails = {};
    if (!newUser.bankDetails) newUser.bankDetails = {};
  } else if (role === 'homemaker') {
    newUser.isActive = true; // Default active status
    // Initialize empty kitchen/bank details if not provided
    if (!newUser.kitchenDetails) newUser.kitchenDetails = {};
    if (!newUser.bankDetails) newUser.bankDetails = {};
    if (!newUser.address) newUser.address = {}; // Ensure address object exists
  } else if (role === 'customer') {
     if (!newUser.address) newUser.address = {}; // Ensure address object exists
  }


  if (!db.users) db.users = [];
  db.users.push(newUser);
  saveDb();

  const { password: _, ...userWithoutPassword } = newUser;
  // Simple token generation
  const token = `${newUser.id}-${newUser.role}`;
  sendJsonResponse(res, 201, { user: userWithoutPassword, token });
}

// --- End Authentication Handlers ---

// Simple routing function (Updated CORS handling)
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true); // Now 'url' is defined
  const pathname = parsedUrl.pathname;
  const method = req.method;
  req.query = parsedUrl.query; // Attach query params to req object

  // Get origin from request headers
  const requestOrigin = req.headers.origin;

  // Set CORS Headers using the updated function
  setCorsHeaders(res, requestOrigin);


  // Handle OPTIONS preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(204); // No Content success status for OPTIONS
    res.end();
    return;
  }

  let requestBody = '';
  req.on('data', chunk => {
    requestBody += chunk.toString();
  });

  req.on('end', () => {
    if (requestBody) {
      try {
        req.body = JSON.parse(requestBody);
      } catch (e) {
        sendJsonResponse(res, 400, { message: 'Invalid JSON in request body' });
        return;
      }
    } else {
      req.body = {};
    }

    // Authentication routes
    if (pathname === '/api/login') {
      return handleLogin(req, res);
    }
    if (pathname === '/api/register') {
      return handleRegister(req, res);
    }

    // Handle API routes
    if (pathname.startsWith('/api/')) {
      const pathParts = pathname.split('/'); // Split path like ['', 'api', 'resource', 'id', ...]
      const resource = pathParts[2];
      const resourceId = pathParts[3]; // Extract potential ID

      // Specific handlers first
      if (pathname.startsWith('/api/cart')) {
        return handleCartRequest(req, res);
      }
      if (pathname.startsWith('/api/delivery/orders')) {
        return handleDeliveryOrderRequest(req, res);
      }
      if (pathname.startsWith('/api/delivery/earnings') || pathname.startsWith('/api/homemaker/earnings')) { // Combine earnings
        return handleEarningsRequest(req, res);
      }
      if (pathname.startsWith('/api/users')) {
        return handleUserProfileRequest(req, res);
      }
      if (pathname.startsWith('/api/meals')) {
        // Pass request to the dedicated meal handler
        return handleMealRequest(req, res); // Assuming meal handler extracts ID internally if needed
      }
      if (pathname.startsWith('/api/orders')) {
        // Pass resourceId (orderId) to the handler
        return handleOrderRequest(req, res, resourceId);
      }
      if (pathname.startsWith('/api/payouts')) {
        return handlePayoutRequest(req, res); // Assuming payout handler extracts ID internally if needed
      }
      // Add handler for categories
      if (pathname === '/api/categories') {
          if (req.method === 'GET') {
              sendJsonResponse(res, 200, db.categories || []);
              return;
          } else {
              sendJsonResponse(res, 405, { message: "Method not allowed for categories" });
              return;
          }
      }


      // Generic resource handling (if no specific handler matched)
      // Avoid generic handling for meals as it's covered above
      if (resource && resource !== 'meals' && db[resource]) {
        // GET all resources
        if (req.method === 'GET' && !resourceId) {
          sendJsonResponse(res, 200, db[resource]);
          return;
        }
        // GET single resource by ID
        if (req.method === 'GET' && resourceId) {
          const item = db[resource].find(item => item.id === resourceId);
          if (item) {
            sendJsonResponse(res, 200, item);
          } else {
            sendJsonResponse(res, 404, { message: `${resource} not found` });
          }
          return;
        }
        // Other methods (POST, PUT, DELETE) could be handled generically here if needed
      }
    }

    // Fallback for unhandled routes
    sendJsonResponse(res, 404, { message: 'Not Found' });
  });
}

const server = http.createServer(handleRequest);
const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});