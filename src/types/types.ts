// src/types/types.ts

// ===== User & Auth =====
export type UserRole = 'admin' | 'staff';

export interface User {
    id: string;
    username: string;
    password: string; // In production, this should be hashed
    role: UserRole;
    name: string;
    createdAt: string;
}

// ===== Customer =====
export interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
    notes: string;
    lastOrderDate?: string;
    createdAt: string;
}

// ===== Chicken Parts =====
export interface ChickenPart {
    id: string;
    name: string;
    pricePerKg: number;
    stock: number; // kg
    unit: string;
    createdAt: string;
}

// ===== Orders =====
export interface OrderItem {
    chickenPartId: string;
    chickenPartName: string;
    quantity: number;
    pricePerKg: number;
    total: number;
}

export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    items: OrderItem[];
    totalAmount: number;
    notes: string;
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

// ===== Employee =====
export interface Employee {
    id: string;
    name: string;
    phone: string;
    baseDailyWage: number;
    notes: string;
    createdAt: string;
}

// ===== Daily Wage =====
export interface DailyWage {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string; // YYYY-MM-DD
    amount: number;
    adjustment: number; // + or - from base
    adjustmentReason: string; // e.g., "หยุดงาน", "ทำงานดี"
    notes: string;
    createdAt: string;
}

// ===== Calendar Notes =====
export interface CalendarNote {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

// ===== Dashboard Stats =====
export interface DashboardStats {
    todayRevenue: number;
    monthlyRevenue: number;
    todayWages: number;
    monthlyWages: number;
    todayProfit: number;
    monthlyProfit: number;
    totalCustomers: number;
    totalEmployees: number;
    lowStockItems: ChickenPart[];
    inactiveCustomers: Customer[];
}
