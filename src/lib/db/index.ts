import fs from "fs";
import path from "path";
import {
  User,
  Address,
  Category,
  Product,
  Order,
  OrderStatus,
  OrderStatusHistoryItem,
  DeliveryPartnerProfile,
  DeliveryAssignment,
  Coupon,
  StoreSettings,
  Notification,
} from "../types";
import {
  initialCategories,
  initialProducts,
  initialUsers,
  initialAddresses,
  initialDeliveryPartner,
  initialStoreSettings,
  initialCoupons,
  initialOrders,
} from "./seed-data";

interface DatabaseSchema {
  users: User[];
  addresses: Address[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  orderStatusHistory: OrderStatusHistoryItem[];
  deliveryPartners: DeliveryPartnerProfile[];
  deliveryAssignments: DeliveryAssignment[];
  coupons: Coupon[];
  storeSettings: StoreSettings;
  notifications: Notification[];
}

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "thesproutspot_db.json");

function getInitialDatabase(): DatabaseSchema {
  const initialHistory: OrderStatusHistoryItem[] = [
    {
      id: "hist-1",
      orderId: "ord-1001",
      status: "PLACED",
      changedByName: "Priya Sharma",
      note: "Order placed online via Cash on Delivery",
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
    {
      id: "hist-2",
      orderId: "ord-1001",
      status: "CONFIRMED",
      changedByName: "Radha Agrawal (Kitchen Head)",
      note: "Order accepted by home kitchen",
      timestamp: new Date(Date.now() - 2.8 * 3600 * 1000).toISOString(),
    },
    {
      id: "hist-3",
      orderId: "ord-1001",
      status: "DELIVERED",
      changedByName: "Raju Verma",
      note: "Delivered to customer doorstep and cash collected",
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: "hist-4",
      orderId: "ord-1002",
      status: "PLACED",
      changedByName: "Priya Sharma",
      note: "Order placed online via UPI",
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: "hist-5",
      orderId: "ord-1002",
      status: "PREPARING",
      changedByName: "Radha Agrawal (Kitchen Head)",
      note: "Fresh meal combo is on the tawa",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
  ];

  const initialAssignments: DeliveryAssignment[] = [
    {
      id: "asgn-1",
      orderId: "ord-1002",
      partnerId: "user-delivery",
      partnerName: "Raju Verma",
      partnerPhone: "+91 98111 22334",
      status: "ACCEPTED",
      assignedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: "asgn-2",
      orderId: "ord-1003",
      partnerId: "user-delivery",
      partnerName: "Raju Verma",
      partnerPhone: "+91 98111 22334",
      status: "PICKED_UP",
      assignedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      pickedUpAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ];

  return {
    users: initialUsers,
    addresses: initialAddresses,
    categories: initialCategories,
    products: initialProducts,
    orders: initialOrders,
    orderStatusHistory: initialHistory,
    deliveryPartners: [initialDeliveryPartner],
    deliveryAssignments: initialAssignments,
    coupons: initialCoupons,
    storeSettings: initialStoreSettings,
    notifications: [],
  };
}

// In-memory cache + disk persistence
let memoryDb: DatabaseSchema | null = null;

function ensureDbFile(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      memoryDb = JSON.parse(raw);
      return memoryDb!;
    }
  } catch (err) {
    console.error("Failed to read DB file, initializing default:", err);
  }

  const initial = getInitialDatabase();
  saveDb(initial);
  memoryDb = initial;
  return memoryDb;
}

function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
    memoryDb = data;
  } catch (err) {
    console.error("Failed to persist database:", err);
    memoryDb = data;
  }
}

// Database helper operations
export const db = {
  // Store Settings
  getStoreSettings(): StoreSettings {
    const data = ensureDbFile();
    return data.storeSettings;
  },

  updateStoreSettings(updates: Partial<StoreSettings>): StoreSettings {
    const data = ensureDbFile();
    data.storeSettings = {
      ...data.storeSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDb(data);
    return data.storeSettings;
  },

  // Users
  getUsers(): User[] {
    const data = ensureDbFile();
    return data.users;
  },

  getUserById(id: string): User | undefined {
    const data = ensureDbFile();
    return data.users.find((u) => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    const data = ensureDbFile();
    return data.users.find(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
  },

  createUser(user: Omit<User, "id" | "createdAt" | "isActive">): User {
    const data = ensureDbFile();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    saveDb(data);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const data = ensureDbFile();
    const idx = data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    data.users[idx] = { ...data.users[idx], ...updates };
    saveDb(data);
    return data.users[idx];
  },

  // Addresses
  getAddresses(userId: string): Address[] {
    const data = ensureDbFile();
    return data.addresses.filter((a) => a.userId === userId);
  },

  saveAddress(addr: Omit<Address, "id" | "createdAt"> & { id?: string }): Address {
    const data = ensureDbFile();
    if (addr.isDefault) {
      data.addresses = data.addresses.map((a) =>
        a.userId === addr.userId ? { ...a, isDefault: false } : a
      );
    }

    if (addr.id) {
      const idx = data.addresses.findIndex((a) => a.id === addr.id);
      if (idx !== -1) {
        data.addresses[idx] = {
          ...data.addresses[idx],
          ...addr,
        };
        saveDb(data);
        return data.addresses[idx];
      }
    }

    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    data.addresses.push(newAddr);
    saveDb(data);
    return newAddr;
  },

  deleteAddress(id: string): boolean {
    const data = ensureDbFile();
    const initLen = data.addresses.length;
    data.addresses = data.addresses.filter((a) => a.id !== id);
    if (data.addresses.length !== initLen) {
      saveDb(data);
      return true;
    }
    return false;
  },

  // Categories
  getCategories(): Category[] {
    const data = ensureDbFile();
    return [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  saveCategory(cat: Partial<Category> & { name: string }): Category {
    const data = ensureDbFile();
    if (cat.id) {
      const idx = data.categories.findIndex((c) => c.id === cat.id);
      if (idx !== -1) {
        data.categories[idx] = { ...data.categories[idx], ...cat } as Category;
        saveDb(data);
        return data.categories[idx];
      }
    }
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: cat.description || "",
      sortOrder: cat.sortOrder ?? data.categories.length + 1,
      isActive: cat.isActive ?? true,
    };
    data.categories.push(newCat);
    saveDb(data);
    return newCat;
  },

  deleteCategory(id: string): boolean {
    const data = ensureDbFile();
    data.categories = data.categories.filter((c) => c.id !== id);
    saveDb(data);
    return true;
  },

  // Products
  getProducts(): Product[] {
    const data = ensureDbFile();
    return data.products;
  },

  getProductById(id: string): Product | undefined {
    const data = ensureDbFile();
    return data.products.find((p) => p.id === id);
  },

  saveProduct(prod: Partial<Product> & { name: string; price: number; categoryId: string }): Product {
    const data = ensureDbFile();
    const now = new Date().toISOString();
    if (prod.id) {
      const idx = data.products.findIndex((p) => p.id === prod.id);
      if (idx !== -1) {
        data.products[idx] = {
          ...data.products[idx],
          ...prod,
          updatedAt: now,
        } as Product;
        saveDb(data);
        return data.products[idx];
      }
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: prod.name,
      slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: prod.description || "",
      price: prod.price,
      categoryId: prod.categoryId,
      isVeg: prod.isVeg ?? true,
      isAvailable: prod.isAvailable ?? true,
      isFeatured: prod.isFeatured ?? false,
      isTodaySpecial: prod.isTodaySpecial ?? false,
      prepTimeMinutes: prod.prepTimeMinutes || 15,
      imageUrl: prod.imageUrl || "/images/food/hero.jpg",
      badge: prod.badge || "",
      variants: prod.variants || [],
      addons: prod.addons || [],
      createdAt: now,
      updatedAt: now,
    };
    data.products.unshift(newProd);
    saveDb(data);
    return newProd;
  },

  deleteProduct(id: string): boolean {
    const data = ensureDbFile();
    data.products = data.products.filter((p) => p.id !== id);
    saveDb(data);
    return true;
  },

  toggleProductAvailability(id: string): Product | undefined {
    const data = ensureDbFile();
    const prod = data.products.find((p) => p.id === id);
    if (!prod) return undefined;
    prod.isAvailable = !prod.isAvailable;
    prod.updatedAt = new Date().toISOString();
    saveDb(data);
    return prod;
  },

  // Orders
  getOrders(): Order[] {
    const data = ensureDbFile();
    return [...data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getOrderById(id: string): Order | undefined {
    const data = ensureDbFile();
    return data.orders.find((o) => o.id === id);
  },

  getOrderByNumber(num: string): Order | undefined {
    const data = ensureDbFile();
    return data.orders.find(
      (o) => o.orderNumber.trim().toUpperCase() === num.trim().toUpperCase()
    );
  },

  getOrdersByCustomerId(customerId: string): Order[] {
    const data = ensureDbFile();
    return data.orders
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrdersByPartnerId(partnerId: string): Order[] {
    const data = ensureDbFile();
    return data.orders
      .filter((o) => o.assignedDeliveryPartnerId === partnerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createOrder(orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">): Order {
    const data = ensureDbFile();
    const now = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TSS-${randomSuffix}`;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    data.orders.unshift(newOrder);

    // Record initial status history
    data.orderStatusHistory.push({
      id: `hist-${Date.now()}`,
      orderId: newOrder.id,
      status: newOrder.orderStatus,
      changedByName: newOrder.customerName,
      note: `Order placed successfully (${newOrder.paymentMethod})`,
      timestamp: now,
    });

    // Notify Admins
    data.notifications.push({
      id: `notif-${Date.now()}`,
      role: "admin",
      title: "New Order Received!",
      message: `${newOrder.customerName} placed order #${newOrder.orderNumber} for ₹${newOrder.total}`,
      link: `/admin/orders/${newOrder.id}`,
      isRead: false,
      createdAt: now,
    });

    saveDb(data);
    return newOrder;
  },

  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    changedByName: string = "Staff",
    changedByUserId?: string
  ): Order | undefined {
    const data = ensureDbFile();
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === "DELIVERED" && order.paymentMethod === "COD") {
      order.paymentStatus = "PAID";
    }

    data.orderStatusHistory.push({
      id: `hist-${Date.now()}`,
      orderId,
      status: newStatus,
      changedByName,
      changedByUserId,
      note: note || `Status updated to ${newStatus}`,
      timestamp: new Date().toISOString(),
    });

    // Notify customer
    data.notifications.push({
      id: `notif-${Date.now()}`,
      userId: order.customerId,
      title: `Order Update: #${order.orderNumber}`,
      message: `Your order is now ${newStatus.replace(/_/g, " ").toLowerCase()}.`,
      link: `/orders/${order.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveDb(data);
    return order;
  },

  assignDeliveryPartner(
    orderId: string,
    partnerId: string,
    partnerName: string,
    partnerPhone: string,
    assignedByName: string = "Admin"
  ): Order | undefined {
    const data = ensureDbFile();
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    order.assignedDeliveryPartnerId = partnerId;
    order.assignedDeliveryPartnerName = partnerName;
    order.assignedDeliveryPartnerPhone = partnerPhone;
    order.updatedAt = new Date().toISOString();

    // Create or update assignment record
    const existingAsgn = data.deliveryAssignments.find((a) => a.orderId === orderId);
    if (existingAsgn) {
      existingAsgn.partnerId = partnerId;
      existingAsgn.partnerName = partnerName;
      existingAsgn.partnerPhone = partnerPhone;
      existingAsgn.status = "ASSIGNED";
      existingAsgn.assignedAt = new Date().toISOString();
    } else {
      data.deliveryAssignments.push({
        id: `asgn-${Date.now()}`,
        orderId,
        partnerId,
        partnerName,
        partnerPhone,
        status: "ASSIGNED",
        assignedAt: new Date().toISOString(),
      });
    }

    // Add status history
    data.orderStatusHistory.push({
      id: `hist-${Date.now()}`,
      orderId,
      status: order.orderStatus,
      changedByName: assignedByName,
      note: `Assigned delivery partner: ${partnerName} (${partnerPhone})`,
      timestamp: new Date().toISOString(),
    });

    // Notify partner
    data.notifications.push({
      id: `notif-${Date.now()}`,
      userId: partnerId,
      role: "delivery",
      title: "New Delivery Assigned!",
      message: `Order #${order.orderNumber} assigned to you. Pickup: The Sprouts Spot Kitchen.`,
      link: `/delivery`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveDb(data);
    return order;
  },

  updateOrder(orderId: string, updates: Partial<Order>): Order | undefined {
    const data = ensureDbFile();
    const idx = data.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return undefined;
    data.orders[idx] = {
      ...data.orders[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDb(data);
    return data.orders[idx];
  },

  getOrderStatusHistory(orderId: string): OrderStatusHistoryItem[] {
    const data = ensureDbFile();
    return data.orderStatusHistory
      .filter((h) => h.orderId === orderId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  // Delivery Partners & Assignments
  getDeliveryPartners(): DeliveryPartnerProfile[] {
    const data = ensureDbFile();
    return data.deliveryPartners;
  },

  getDeliveryPartnerProfile(userId: string): DeliveryPartnerProfile | undefined {
    const data = ensureDbFile();
    return data.deliveryPartners.find((dp) => dp.userId === userId);
  },

  updateDeliveryPartnerStatus(userId: string, isAvailable: boolean): DeliveryPartnerProfile | undefined {
    const data = ensureDbFile();
    let partner = data.deliveryPartners.find((dp) => dp.userId === userId);
    if (!partner) {
      const user = data.users.find((u) => u.id === userId);
      partner = {
        id: `dp-${Date.now()}`,
        userId,
        name: user?.name || "Delivery Partner",
        phone: user?.phone || "+91 98000 00000",
        vehicleType: "Motorcycle",
        isAvailable,
        totalDeliveries: 0,
        totalEarnings: 0,
        pendingPayout: 0,
        commissionPerOrder: 40,
        rating: 5.0,
      };
      data.deliveryPartners.push(partner);
    } else {
      partner.isAvailable = isAvailable;
    }
    saveDb(data);
    return partner;
  },

  getDeliveryAssignments(partnerId: string): DeliveryAssignment[] {
    const data = ensureDbFile();
    return data.deliveryAssignments.filter((a) => a.partnerId === partnerId);
  },

  updateDeliveryAssignment(
    assignmentId: string,
    updates: Partial<DeliveryAssignment>
  ): DeliveryAssignment | undefined {
    const data = ensureDbFile();
    const asgn = data.deliveryAssignments.find((a) => a.id === assignmentId);
    if (!asgn) return undefined;

    Object.assign(asgn, updates);

    // If marked delivered, update partner earnings
    if (updates.status === "DELIVERED") {
      const partner = data.deliveryPartners.find((dp) => dp.userId === asgn.partnerId);
      if (partner) {
        partner.totalDeliveries += 1;
        partner.totalEarnings += partner.commissionPerOrder;
        partner.pendingPayout += partner.commissionPerOrder;
      }
    }

    saveDb(data);
    return asgn;
  },

  // Coupons
  getCoupons(): Coupon[] {
    const data = ensureDbFile();
    return data.coupons;
  },

  validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const data = ensureDbFile();
    const coupon = data.coupons.find(
      (c) => c.code.trim().toUpperCase() === code.trim().toUpperCase() && c.isActive
    );

    if (!coupon) {
      return { valid: false, discount: 0, message: "Invalid or inactive promo code." };
    }

    if (new Date(coupon.validUntil).getTime() < Date.now()) {
      return { valid: false, discount: 0, message: "This coupon code has expired." };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Cart subtotal must be at least ₹${coupon.minOrderValue} to apply this code.`,
      };
    }

    let discount = 0;
    if (coupon.discountType === "FLAT") {
      discount = coupon.discountValue;
    } else {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    return {
      valid: true,
      discount,
      message: `Coupon applied! You saved ₹${discount}`,
      coupon,
    };
  },

  saveCoupon(coupon: Partial<Coupon> & { code: string; discountValue: number }): Coupon {
    const data = ensureDbFile();
    if (coupon.id) {
      const idx = data.coupons.findIndex((c) => c.id === coupon.id);
      if (idx !== -1) {
        data.coupons[idx] = { ...data.coupons[idx], ...coupon } as Coupon;
        saveDb(data);
        return data.coupons[idx];
      }
    }
    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: coupon.code.toUpperCase(),
      discountType: coupon.discountType || "FLAT",
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscount: coupon.maxDiscount,
      validUntil: coupon.validUntil || "2027-12-31",
      isActive: coupon.isActive ?? true,
      usageCount: 0,
    };
    data.coupons.push(newCoupon);
    saveDb(data);
    return newCoupon;
  },

  deleteCoupon(id: string): boolean {
    const data = ensureDbFile();
    data.coupons = data.coupons.filter((c) => c.id !== id);
    saveDb(data);
    return true;
  },

  // Notifications
  getNotifications(userId?: string, role?: string): Notification[] {
    const data = ensureDbFile();
    return data.notifications
      .filter((n) => {
        if (userId && n.userId === userId) return true;
        if (role && n.role === role) return true;
        return false;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markNotificationRead(id: string): void {
    const data = ensureDbFile();
    const notif = data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      saveDb(data);
    }
  },

  createNotification(notif: Omit<Notification, "id" | "isRead" | "createdAt">): Notification {
    const data = ensureDbFile();
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    data.notifications.unshift(newNotif);
    saveDb(data);
    return newNotif;
  },
};
