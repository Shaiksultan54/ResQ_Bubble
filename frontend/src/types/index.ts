// Authentication Types
export interface User {
  _id: string;
  id?: string; // For backward compatibility
  email: string;
  firstName: string;
  lastName: string;
  loginId?: string;
  role: 'admin' | 'manager' | 'user' | 'staff';
  agency: Agency | string;
  active: boolean;
  permissions?: {
    canManageInventory?: boolean;
    canManageUsers?: boolean;
    canSendAlerts?: boolean;
    canApproveBorrows?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Agency Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Agency {
  _id: string;
  name: string;
  type: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory Types
export interface CurrentHolder {
  agency: Agency;
  since: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  category: 'Medical' | 'Food' | 'Shelter' | 'Transportation' | 'Communication' | 'Rescue' | 'Other';
  subcategory?: string;
  description?: string;
  quantity: number;
  unit: string;
  status: 'available' | 'borrowed' | 'in-use' | 'maintenance' | 'depleted';
  agency: string | Agency;
  image?: string;
  location?: string;
  expiryDate?: string;
  tags?: string[];
  currentHolder?: CurrentHolder;
  createdAt: string;
  updatedAt: string;
}

// Borrow Types
export interface Condition {
  description?: string;
  images?: string[];
}

export interface BorrowCondition {
  beforeBorrow?: Condition;
  afterReturn?: Condition;
}

export interface Borrow {
  _id: string;
  item: string | InventoryItem;
  quantity: number;
  ownerAgency: string | Agency;
  borrowerAgency: string | Agency;
  requestedBy: string | User;
  approvedBy?: string | User;
  status: 'pending' | 'approved' | 'rejected' | 'returned' | 'overdue';
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  purpose: string;
  notes?: string;
  condition?: BorrowCondition;
  createdAt: string;
  updatedAt: string;
}

// Message Types
export interface Message {
  _id: string;
  sender: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  senderAgency: string | {
    _id: string;
    name: string;
  };
  recipient: string | {
    _id: string;
    name: string;
  };
  content: string;
  read: boolean;
  referencedItems?: string[] | InventoryItem[];
  referencedBorrows?: string[] | Borrow[];
  attachment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageData {
  recipientAgencyId: string;
  content: string;
  referencedItems?: string[];
  referencedBorrows?: string[];
  attachment?: string;
}

// Alert Types
export interface AlertRecipient {
  agency: string | Agency;
  read: boolean;
  readAt?: string;
}

export interface Alert {
  _id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: [number, number];
  radius: number;
  createdBy: Agency;
  sender: Agency;
  status: 'active' | 'inactive';
  recipients: {
    agency: Agency;
    read: boolean;
    readAt?: Date;
  }[];
  readBy: string[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isRead?: boolean;
  readAt?: Date;
}

// Transfer Types
export interface TransferLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  timestamp: string;
  speed?: number;
  heading?: number;
}

export interface Waypoint {
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  timestamp: string;
  event: 'checkpoint' | 'stop' | 'delay' | 'emergency';
  notes?: string;
}

export interface TransferRoute {
  startLocation: TransferLocation;
  endLocation: TransferLocation;
  currentLocation?: TransferLocation;
  waypoints: Waypoint[];
}

export interface TransferNotification {
  type: 'dispatch' | 'location_update' | 'delay' | 'delivery' | 'emergency';
  message: string;
  timestamp: string;
  recipients: {
    user: string | User;
    read: boolean;
    readAt?: string;
  }[];
}

export interface TransferPhoto {
  url: string;
  type: 'pickup' | 'transit' | 'delivery' | 'incident';
  timestamp: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  notes?: string;
}

export interface DeliveryConfirmation {
  receivedBy: string | User;
  signature?: string;
  photo?: string;
  timestamp: string;
  notes?: string;
}

export interface Transfer {
  _id: string;
  transferId: string;
  item: string | InventoryItem;
  quantity: number;
  fromAgency: string | Agency;
  toAgency: string | Agency;
  assignedStaff: string | User;
  dispatchedBy: string | User;
  status: 'pending' | 'dispatched' | 'in-transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  route: TransferRoute;
  notifications: TransferNotification[];
  specialInstructions?: string;
  securityCode: string;
  photos: TransferPhoto[];
  deliveryConfirmation?: DeliveryConfirmation;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}