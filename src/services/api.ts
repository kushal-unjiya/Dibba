import { Order, OrderStatus, OrderStatusChange } from '../interfaces/Order'; // Added OrderStatus, OrderStatusChange
import { DeliveryOrder } from '../interfaces/DeliveryOrder'; // Added DeliveryOrder
import { DeliveryPartner } from '../interfaces/DeliveryPartner'; // Added DeliveryPartner

// API base URL
const API_BASE_URL = 'http://localhost:3001';

// Custom error class for API errors
export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Helper function for HTTP requests
async function request<T>(
  endpoint: string, 
  method: string = 'GET', 
  data: any = null,
  token: string | null = null
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new APIError(response.status, `HTTP error! Status: ${response.status}`);
      }
      return {} as T;
    }
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new APIError(
        response.status,
        result.message || `HTTP error! Status: ${response.status}`
      );
    }
    
    return result as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, 'Network error or server is unavailable');
  }
}

/* Auth API */
export const authAPI = {
  login: (email: string, password: string, role: string) => 
    request<{ user: any, token: string }>('/api/login', 'POST', { email, password, role }),
    
  registerCustomer: (userData: any) => 
    request<{ user: any, token: string }>('/api/register', 'POST', { ...userData, role: 'customer' }),
    
  registerHomemaker: (userData: any) => 
    request<{ user: any, token: string }>('/api/register', 'POST', { ...userData, role: 'homemaker' }),
    
  registerDelivery: (userData: any) => 
    request<{ user: any, token: string }>('/api/register', 'POST', { ...userData, role: 'delivery' }),
};

/* Users API */
export const usersAPI = {
  getCurrentUser: (token: string) => 
    request('/api/users/me', 'GET', null, token),
    
  updateProfile: (userId: string, userData: any, token: string) => 
    request(`/api/users/${userId}`, 'PATCH', userData, token),
    
  updateAddress: (userId: string, addressData: any, token: string) => 
    request(`/api/users/${userId}/addresses`, 'PUT', addressData, token),
};

/* Meals API */
export const mealsAPI = {
  getAllMeals: () => 
    request<any[]>('/api/meals'),
    
  getMealById: (mealId: string) => 
    request<any>(`/api/meals/${mealId}`),
    
  getMealsByHomemaker: (homemakerId: string) => 
    request<any[]>(`/api/meals?homemakerId=${homemakerId}`),
    
  createMeal: (mealData: any, token: string) => 
    request('/api/meals', 'POST', mealData, token),
    
  updateMeal: (mealId: string, mealData: any, token: string) => 
    request(`/api/meals/${mealId}`, 'PATCH', mealData, token),
    
  deleteMeal: (mealId: string, token: string) => 
    request(`/api/meals/${mealId}`, 'DELETE', null, token),
};

/* Orders API */
export const ordersAPI = {
  getCustomerOrders: (customerId: string, token: string) => 
    request<any[]>(`/api/orders?customerId=${customerId}`, 'GET', null, token),
    
  getHomemakerOrders: (homemakerId: string, token: string) => 
    request<any[]>(`/api/orders?homemakerId=${homemakerId}`, 'GET', null, token),
    
  getDeliveryOrders: (deliveryPartnerId: string, token: string) => 
    request<any[]>(`/api/orders?deliveryPartnerId=${deliveryPartnerId}`, 'GET', null, token),
    
  getOrderById: (orderId: string, token: string) => 
    request<any>(`/api/orders/${orderId}`, 'GET', null, token),
    
  createOrder: (orderData: any, token: string) => 
    request('/api/orders', 'POST', orderData, token),
    
  updateOrderStatus: (orderId: string, status: OrderStatus, token: string) => 
    request<Order>(`/api/orders/${orderId}`, 'PATCH', { 
      status,
      updatedAt: new Date().toISOString()
    }, token),

  // New method for tracking order status changes
  getOrderStatusHistory: (orderId: string, token: string) =>
    request<OrderStatusChange[]>(`/api/orders/${orderId}/history`, 'GET', null, token),

  // New method for delivery partner to accept order
  acceptDeliveryOrder: (orderId: string, deliveryPartnerId: string, token: string) =>
    request<Order>(`/api/orders/${orderId}/accept`, 'POST', { deliveryPartnerId }, token),

  // New method for updating delivery location
  updateDeliveryLocation: (orderId: string, location: { lat: number; lng: number }, token: string) =>
    request<void>(`/api/orders/${orderId}/location`, 'POST', location, token),

  getDeliveryPartner: async (deliveryPartnerId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${deliveryPartnerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch delivery partner details');
    return response.json();
  }
};

/* Delivery API */
export const deliveryAPI = {
  getAvailableOrders: (token: string) => 
    request<DeliveryOrder[]>('/api/delivery/orders/available', 'GET', null, token),
    
  getCurrentOrder: (token: string) => 
    request<DeliveryOrder | null>('/api/delivery/orders/current', 'GET', null, token),
    
  updateOrderStatus: (orderId: string, status: OrderStatus, token: string) => 
    request<DeliveryOrder>(`/api/delivery/orders/${orderId}/status`, 'POST', { status }, token),

  getEarningsSummary: (token: string) => 
    request('/api/earnings/summary', 'GET', null, token),
    
  getEarningsHistory: (token: string) => 
    request('/api/earnings/history', 'GET', null, token),
    
  getEarningsChartData: (token: string) => 
    request('/api/earnings/chart', 'GET', null, token),

  requestPayout: (token: string, bankDetails: any) =>
    request('/api/payouts', 'POST', { bankDetails }, token),

  getPayoutHistory: (token: string) =>
    request('/api/payouts', 'GET', null, token),

  getDeliveryPartner: (partnerId: string, token: string) =>
    request<DeliveryPartner>(`/api/delivery/partner/${partnerId}`, 'GET', null, token)
};

/* Homemakers API */
export const homemakersAPI = {
  getAllHomemakers: () => 
    request<any[]>('/api/users?role=homemaker'),
    
  getHomemakerById: (homemakerId: string) => 
    request<any>(`/api/users/${homemakerId}`),
    
  getHomemakerMeals: (homemakerId: string) => 
    request<any[]>(`/api/meals?homemakerId=${homemakerId}`),
    
  getHomemakerReviews: (homemakerId: string) => 
    request<any[]>(`/api/reviews?homemakerId=${homemakerId}`),
};

/* Earnings API */
export const earningsAPI = {
  getSummary: (token: string) => 
    request('/api/earnings/summary', 'GET', null, token),
    
  getHistory: (token: string) => 
    request('/api/earnings/history', 'GET', null, token),
    
  getChartData: (token: string) => 
    request('/api/earnings/chart', 'GET', null, token),

  requestPayout: (token: string, bankDetails: any) =>
    request('/api/payouts', 'POST', { bankDetails }, token),

  getPayoutHistory: (token: string) =>
    request('/api/payouts', 'GET', null, token)
};