export type UserRole = "customer" | "admin" | "delivery";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label?: string; // Home, Office, Other
  houseFlat: string;
  landmark?: string;
  areaLocality: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Regular", "Large", "Half", "Full"
  price: number; // in Rupees
}

export interface ProductAddon {
  id: string;
  name: string; // e.g. "Extra Amul Cheese", "Brown Bread", "Green Chutney Cup"
  price: number; // in Rupees
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // base price in Rupees
  categoryId: string;
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  isTodaySpecial: boolean;
  prepTimeMinutes: number;
  imageUrl: string;
  badge?: string; // e.g. "Bestseller", "Chef Special", "High Protein"
  variants?: ProductVariant[];
  addons?: ProductAddon[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "UPI" | "ONLINE";

export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED";

export interface OrderItemCustomization {
  variant?: { id: string; name: string; price: number };
  addons?: Array<{ id: string; name: string; price: number }>;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  customization?: OrderItemCustomization;
  imageUrl?: string;
}

export interface DeliveryAddressSnapshot {
  houseFlat: string;
  landmark?: string;
  areaLocality: string;
  city: string;
  instructions?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  status: OrderStatus;
  changedByUserId?: string;
  changedByName: string;
  note?: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "TSS-8291"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: DeliveryAddressSnapshot;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  assignedDeliveryPartnerId?: string;
  assignedDeliveryPartnerName?: string;
  assignedDeliveryPartnerPhone?: string;
  cancellationReason?: string;
  internalNotes?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export type DeliveryAssignmentStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "DECLINED"
  | "ARRIVED_KITCHEN"
  | "PICKED_UP"
  | "DELIVERED"
  | "CANCELLED";

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  partnerId: string;
  partnerName: string;
  partnerPhone: string;
  status: DeliveryAssignmentStatus;
  declineReason?: string;
  codCollected?: boolean;
  problemReport?: string;
  assignedAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

export interface DeliveryPartnerProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  vehicleType: string; // "Bike", "Scooter", "Bicycle"
  vehicleNumber?: string;
  isAvailable: boolean;
  totalDeliveries: number;
  totalEarnings: number;
  pendingPayout: number;
  commissionPerOrder: number;
  rating: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number; // e.g. 20 for 20% or 50 for ₹50
  minOrderValue: number;
  maxDiscount?: number; // max cap for percentage discounts
  validUntil: string;
  isActive: boolean;
  usageCount: number;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  tagline: string;
  isOpen: boolean;
  openingTime: string; // "08:30"
  closingTime: string; // "22:00"
  estimatedPrepMinutes: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minOrderValue: number;
  serviceableAreas: string[];
  businessPhone: string;
  whatsappNumber: string;
  kitchenAddress: string;
  enableCod: boolean;
  enableUpi: boolean;
  upiId: string;
  enableOnlinePayment: boolean;
  partnerCommissionPerOrder: number;
  announcement?: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId?: string;
  role?: UserRole;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
