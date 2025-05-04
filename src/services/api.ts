// API base URL
const API_BASE_URL = 'http://localhost:3001';

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
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  // For non-JSON responses
  if (!response.headers.get('content-type')?.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return {} as T;
  }
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || `HTTP error! Status: ${response.status}`);
  }
  
  return result as T;
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
    
  updateOrderStatus: (orderId: string, status: string, token: string) => 
    request(`/api/orders/${orderId}`, 'PATCH', { status }, token),
    
  addReview: (orderId: string, reviewData: any, token: string) => 
    request(`/api/reviews`, 'POST', { orderId, ...reviewData }, token),
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