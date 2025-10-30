import axios, { AxiosError } from 'axios';
import { Alert, ApiResponse } from '../types';

const BASE_URL = 'http://localhost:5000/api';

// Types
interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  agency: {
    name: string;
    type: string;
    contactEmail: string;
    contactPhone: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
}

interface Credentials {
  email?: string;
  loginId?: string;
  password: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
}

interface UserParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

interface InventoryItemData {
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  agency: string;
}

export interface MessageData {
  recipientAgencyId: string;
  content: string;
  referencedItems?: string[];
  referencedBorrows?: string[];
  attachment?: string;
}

export interface AlertData {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: [number, number]; // [longitude, latitude]
  radius: number;
  expiresAt: string;
}

interface StatusData {
  status?: string;
  active?: boolean;
}

interface AgencyData {
  name: string;
  type: string;
  contactEmail: string;
  contactPhone: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

interface BorrowData {
  itemId: string;
  quantity: number;
  ownerAgencyId: string;
  expectedReturnDate: Date;
  purpose: string;
}

interface BorrowRequestParams {
  agency?: string;
  status?: string;
}

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to inject auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (userData: UserData) => {
    try {
      console.log('Sending registration request:', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        agencyName: userData.agency?.name,
        agencyType: userData.agency?.type,
        contactPhone: userData.agency?.contactPhone,
        hasLocation: !!userData.agency?.location?.coordinates
      });
      
      const response = await api.post('/auth/register', userData);
      
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Registration API error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Registration error:', error);
      }
      throw error;
    }
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  loginWithId: async (loginId: string, password: string) => {
    const response = await api.post('/auth/login-with-id', { loginId, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (profileData: ProfileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
  changePassword: async (passwordData: PasswordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },
  setAuthToken: (token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  }
};

// User API
export const userAPI = {
  getAllUsers: async (params: UserParams) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  getAgencyUsers: async (agencyId: string) => {
    const response = await api.get(`/users/agency/${agencyId}`);
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (userData: UserData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  updateUser: async (id: string, userData: UserData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  updateUserStatus: async (id: string, statusData: StatusData) => {
    const response = await api.put(`/users/${id}/status`, statusData);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

// Agency API
export const agencyAPI = {
  getAllAgencies: async () => {
    const response = await api.get('/agencies');
    return response.data;
  },
  getAgencyById: async (id: string) => {
    const response = await api.get(`/agencies/${id}`);
    return response.data;
  },
  createAgency: async (agencyData: AgencyData) => {
    const response = await api.post('/agencies', agencyData);
    return response.data;
  },
  updateAgency: async (id: string, agencyData: AgencyData) => {
    const response = await api.put(`/agencies/${id}`, agencyData);
    return response.data;
  },
  getNearbyAgencies: async (distance: number, longitude: number, latitude: number) => {
    const response = await api.get(`/agencies/nearby/${distance}?longitude=${longitude}&latitude=${latitude}`);
    return response.data;
  },
  getAgenciesByType: async (type: string) => {
    const response = await api.get(`/agencies/type/${type}`);
    return response.data;
  }
};

// Inventory API
export const inventoryAPI = {
  getAgencyInventory: async (agencyId: string) => {
    const response = await api.get(`/inventory/agency/${agencyId}`);
    return response.data;
  },
  getInventoryItemById: async (id: string) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },
  createInventoryItem: async (itemData: InventoryItemData) => {
    const response = await api.post('/inventory', itemData);
    return response.data;
  },
  updateInventoryItem: async (id: string, itemData: InventoryItemData) => {
    const response = await api.put(`/inventory/${id}`, itemData);
    return response.data;
  },
  deleteInventoryItem: async (id: string) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },
  searchInventory: async (params: UserParams) => {
    const response = await api.get('/inventory/search', { params });
    return response.data;
  },
  getAvailableItemsByCategory: async (category: string) => {
    const response = await api.get(`/inventory/available/${category}`);
    return response.data;
  },
  getOtherAgenciesInventory: async () => {
    try {
      console.log('Fetching other agencies inventory...');
      const response = await api.get('/inventory/other-agencies');
      console.log('Response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in getOtherAgenciesInventory:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }
};

// Borrow API
export const borrowAPI = {
  getAllBorrowRequests: async (params: BorrowRequestParams) => {
    const response = await api.get('/borrow', { params });
    return response.data;
  },
  getBorrowById: async (id: string) => {
    const response = await api.get(`/borrow/${id}`);
    return response.data;
  },
  createBorrowRequest: async (borrowData: BorrowData) => {
    const response = await api.post('/borrow', borrowData);
    return response.data;
  },
  updateBorrowStatus: async (id: string, statusData: StatusData) => {
    const response = await api.put(`/borrow/${id}/status`, statusData);
    return response.data;
  },
  getAgencyBorrowHistory: async (agencyId: string) => {
    const response = await api.get(`/borrow/history/agency/${agencyId}`);
    return response.data;
  },
  getItemBorrowHistory: async (itemId: string) => {
    const response = await api.get(`/borrow/history/item/${itemId}`);
    return response.data;
  }
};

// Message API
export const messageAPI = {
  getAgencyMessages: async (agencyId: string) => {
    const response = await api.get(`/messages/agency/${agencyId}`);
    return response.data;
  },
  getConversation: async (agency1Id: string, agency2Id: string) => {
    const response = await api.get(`/messages/conversation/${agency1Id}/${agency2Id}`);
    return response.data;
  },
  sendMessage: async (messageData: MessageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
  markMessageAsRead: async (id: string) => {
    const response = await api.put(`/messages/${id}/read`);
    return response.data;
  },
  getUnreadCount: async (agencyId: string) => {
    const response = await api.get(`/messages/unread/count/${agencyId}`);
    return response.data;
  }
};

// Alert API
export const alertAPI = {
  getAgencyAlerts: async (agencyId: string): Promise<Alert[]> => {
    try {
      const response = await api.get<ApiResponse<Alert[]>>(`/alerts/agency/${agencyId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error in getAgencyAlerts:', error);
      return [];
    }
  },

  createAlert: async (alertData: AlertData): Promise<Alert> => {
    try {
      const response = await api.post<ApiResponse<Alert>>('/alerts', alertData);
      return response.data.data;
    } catch (error) {
      console.error('Error in createAlert:', error);
      throw error;
    }
  },

  markAlertAsRead: async (alertId: string): Promise<void> => {
    try {
      await api.put(`/alerts/${alertId}/read`);
    } catch (error) {
      console.error('Error in markAlertAsRead:', error);
      throw error;
    }
  },

  getUnreadAlertCount: async (agencyId: string): Promise<number> => {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>(`/alerts/unread/count/${agencyId}`);
      return response.data.data?.count || 0;
    } catch (error) {
      console.error('Error in getUnreadAlertCount:', error);
      return 0;
    }
  }
};

// Transfer API
export const transferAPI = {
  createTransfer: async (transferData: {
    itemId: string;
    quantity: number;
    toAgencyId: string;
    assignedStaffId: string;
    estimatedDeliveryTime: Date;
    priority: 'low' | 'medium' | 'high' | 'critical';
    specialInstructions?: string;
  }) => {
    const response = await api.post('/transfers', transferData);
    return response.data;
  },

  updateTransferLocation: async (transferId: string, locationData: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
  }) => {
    const response = await api.put(`/transfers/${transferId}/location`, locationData);
    return response.data;
  },

  getActiveTransfers: async (agencyId: string) => {
    try {
      const response = await api.get(`/transfers/active/${agencyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transfers:', error);
      throw error;
    }
  },

  getTransferById: async (transferId: string) => {
    const response = await api.get(`/transfers/${transferId}`);
    return response.data;
  },

  updateTransferStatus: async (transferId: string, statusData: {
    status: 'dispatched' | 'in-transit' | 'delivered' | 'cancelled';
    notes?: string;
    securityCode?: string;
  }) => {
    const response = await api.put(`/transfers/${transferId}/status`, statusData);
    return response.data;
  },

  addTransferPhoto: async (transferId: string, photoData: FormData) => {
    const response = await api.post(`/transfers/${transferId}/photos`, photoData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getTransferHistory: async (agencyId: string) => {
    const response = await api.get(`/transfers/history/${agencyId}`);
    return response.data;
  },

  emergencyAlert: async (transferId: string, alertData: {
    message: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  }) => {
    const response = await api.post(`/transfers/${transferId}/emergency`, alertData);
    return response.data;
  }
};

export default api;
