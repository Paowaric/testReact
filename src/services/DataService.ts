// src/services/DataService.ts
// Uses Backend API for data operations

import type {
    Customer,
    ChickenPart,
    Order,
    Employee,
    DailyWage,
    CalendarNote,
    OrderItem,
} from '../types/types';
import {
    CustomersApi,
    ChickenPartsApi,
    OrdersApi,
    EmployeesApi,
    WagesApi,
    CalendarNotesApi,
} from './ApiService';

// Helper to convert backend entity to frontend type (id: number -> string)
// Helper to convert backend entity to frontend type (id: number -> string)
function toFrontendId(entity: any): any {
    return { ...entity, id: String(entity.id) };
}

function toBackendId(id: string): number {
    return parseInt(id, 10);
}

// ===== CUSTOMERS =====
export const CustomerService = {
    async getAll(): Promise<Customer[]> {
        const data = await CustomersApi.getAll();
        return (data || []).map(toFrontendId);
    },

    async getById(id: string): Promise<Customer | undefined> {
        try {
            const data = await CustomersApi.getById(toBackendId(id));
            return toFrontendId(data);
        } catch {
            return undefined;
        }
    },

    async create(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
        const result = await CustomersApi.create(data);
        return toFrontendId(result);
    },

    async update(id: string, data: Partial<Customer>): Promise<Customer | undefined> {
        try {
            const result = await CustomersApi.update(toBackendId(id), data);
            return toFrontendId(result);
        } catch {
            return undefined;
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            await CustomersApi.delete(toBackendId(id));
            return true;
        } catch {
            return false;
        }
    },

    async getInactiveCustomers(): Promise<Customer[]> {
        const data = await CustomersApi.getInactive();
        return (data || []).map(toFrontendId);
    },
};

// ===== CHICKEN PARTS =====
export const ChickenPartService = {
    async getAll(): Promise<ChickenPart[]> {
        const data = await ChickenPartsApi.getAll();
        return (data || []).map(toFrontendId);
    },

    async getById(id: string): Promise<ChickenPart | undefined> {
        try {
            const data = await ChickenPartsApi.getById(toBackendId(id));
            return toFrontendId(data);
        } catch {
            return undefined;
        }
    },

    async create(data: Omit<ChickenPart, 'id' | 'createdAt'>): Promise<ChickenPart> {
        const result = await ChickenPartsApi.create(data);
        return toFrontendId(result);
    },

    async update(id: string, data: Partial<ChickenPart>): Promise<ChickenPart | undefined> {
        try {
            const result = await ChickenPartsApi.update(toBackendId(id), data);
            return toFrontendId(result);
        } catch {
            return undefined;
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            await ChickenPartsApi.delete(toBackendId(id));
            return true;
        } catch {
            return false;
        }
    },

    async adjustStock(id: string, amount: number): Promise<ChickenPart | undefined> {
        try {
            const result = await ChickenPartsApi.adjustStock(toBackendId(id), amount);
            return toFrontendId(result);
        } catch {
            return undefined;
        }
    },

    async getLowStock(): Promise<ChickenPart[]> {
        const data = await ChickenPartsApi.getLowStock();
        return (data || []).map(toFrontendId);
    },
};

// ===== ORDERS =====
export const OrderService = {
    async getAll(): Promise<Order[]> {
        const data = await OrdersApi.getAll();
        return (data || []).map((o: any) => ({
            ...toFrontendId(o),
            customerId: String(o.customerId),
            customerName: o.customer ? o.customer.name : (o.customerName || 'Unknown'),
            items: o.items || [],
        }));
    },

    async getById(id: string): Promise<Order | undefined> {
        try {
            const data = await OrdersApi.getById(toBackendId(id));
            return {
                ...toFrontendId(data),
                customerId: String(data.customerId),
                items: data.items || [],
            };
        } catch {
            return undefined;
        }
    },

    async getByCustomer(customerId: string): Promise<Order[]> {
        const data = await OrdersApi.getByCustomer(toBackendId(customerId));
        return (data || []).map((o: any) => ({
            ...toFrontendId(o),
            customerId: String(o.customerId),
            items: o.items || [],
        }));
    },

    async create(data: {
        customerId: string;
        customerName: string;
        items: OrderItem[];
        notes?: string;
    }): Promise<Order> {
        const result = await OrdersApi.create({
            customerId: toBackendId(data.customerId),
            customerName: data.customerName,
            items: data.items.map(item => {
                const cleanItem: any = {
                    ...item,
                    chickenPartId: parseInt(String(item.chickenPartId), 10),
                    quantity: Number(item.quantity),
                    pricePerKg: Number(item.pricePerKg),
                    total: Number(item.total),
                };
                delete cleanItem.id; // New items should not have ID
                delete cleanItem.orderId;
                return cleanItem;
            }),
            notes: data.notes || '',
        });
        return {
            ...toFrontendId(result),
            customerId: String(result.customerId),
            items: result.items || [],
        };
    },

    async update(id: string, data: Partial<Order>): Promise<Order | undefined> {
        try {
            const updateData: any = { ...data };
            if (data.customerId) {
                updateData.customerId = toBackendId(data.customerId);
            }

            if (data.items) {
                updateData.items = data.items.map((item: any) => {
                    const cleanItem: any = {
                        ...item,
                        chickenPartId: parseInt(String(item.chickenPartId), 10),
                        quantity: Number(item.quantity),
                        pricePerKg: Number(item.pricePerKg),
                        total: Number(item.total),
                    };
                    // Ensure ID is number if present (for updates)
                    if (item.id) {
                        cleanItem.id = parseInt(String(item.id), 10);
                    }
                    // Remove orderId if present to avoid type issues (let backend handle relation)
                    delete cleanItem.orderId;
                    return cleanItem;
                });
            }

            const result = await OrdersApi.update(toBackendId(id), updateData);
            return {
                ...toFrontendId(result),
                customerId: String(result.customerId),
                items: result.items || [],
            };
        } catch (error) {
            console.error('Update Order Error:', error);
            return undefined;
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            await OrdersApi.delete(toBackendId(id));
            return true;
        } catch {
            return false;
        }
    },

    async getTodayRevenue(): Promise<number> {
        return OrdersApi.getTodayRevenue();
    },

    async getMonthlyRevenue(): Promise<number> {
        return OrdersApi.getMonthlyRevenue();
    },
};

// ===== EMPLOYEES =====
export const EmployeeService = {
    async getAll(): Promise<Employee[]> {
        const data = await EmployeesApi.getAll();
        return (data || []).map(toFrontendId);
    },

    async getById(id: string): Promise<Employee | undefined> {
        try {
            const data = await EmployeesApi.getById(toBackendId(id));
            return toFrontendId(data);
        } catch {
            return undefined;
        }
    },

    async create(data: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee> {
        const result = await EmployeesApi.create(data);
        return toFrontendId(result);
    },

    async update(id: string, data: Partial<Employee>): Promise<Employee | undefined> {
        try {
            const result = await EmployeesApi.update(toBackendId(id), data);
            return toFrontendId(result);
        } catch {
            return undefined;
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            await EmployeesApi.delete(toBackendId(id));
            return true;
        } catch {
            return false;
        }
    },
};

// ===== DAILY WAGES =====
export const DailyWageService = {
    async getAll(): Promise<DailyWage[]> {
        const data = await WagesApi.getAll();
        return (data || []).map((w: any) => ({
            ...toFrontendId(w),
            employeeId: String(w.employeeId),
        }));
    },

    async getByEmployee(employeeId: string): Promise<DailyWage[]> {
        const data = await WagesApi.getByEmployee(toBackendId(employeeId));
        return (data || []).map((w: any) => ({
            ...toFrontendId(w),
            employeeId: String(w.employeeId),
        }));
    },

    async getByDate(date: string): Promise<DailyWage[]> {
        const data = await WagesApi.getByDate(date);
        return (data || []).map((w: any) => ({
            ...toFrontendId(w),
            employeeId: String(w.employeeId),
        }));
    },

    async create(data: Omit<DailyWage, 'id' | 'createdAt'>): Promise<DailyWage> {
        const result = await WagesApi.create({
            ...data,
            employeeId: toBackendId(data.employeeId),
        });
        return {
            ...toFrontendId(result),
            employeeId: String(result.employeeId),
        };
    },

    async update(id: string, data: Partial<DailyWage>): Promise<DailyWage | undefined> {
        try {
            const updateData: any = { ...data };
            if (data.employeeId) {
                updateData.employeeId = toBackendId(data.employeeId);
            }
            const result = await WagesApi.update(toBackendId(id), updateData);
            return {
                ...toFrontendId(result),
                employeeId: String(result.employeeId),
            };
        } catch {
            return undefined;
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            await WagesApi.delete(toBackendId(id));
            return true;
        } catch {
            return false;
        }
    },

    async getMonthlyTotal(employeeId: string, year: number, month: number): Promise<number> {
        return WagesApi.getMonthlyTotal(toBackendId(employeeId), year, month);
    },

    async getTodayTotal(): Promise<number> {
        return WagesApi.getTodayTotal();
    },

    async getMonthTotal(): Promise<number> {
        return WagesApi.getMonthTotal();
    },
};

// ===== CALENDAR NOTES =====
export const CalendarNoteService = {
    async getAll(): Promise<CalendarNote[]> {
        const data = await CalendarNotesApi.getAll();
        return (data || []).map(toFrontendId);
    },

    async getByDate(date: string): Promise<CalendarNote[]> {
        const data = await CalendarNotesApi.getByDate(date);
        return (data || []).map(toFrontendId);
    },

    async create(data: Omit<CalendarNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarNote> {
        const result = await CalendarNotesApi.create(data);
        return toFrontendId(result);
    },

    async update(id: string, data: Partial<CalendarNote>): Promise<CalendarNote | undefined> {
        try {
            const result = await CalendarNotesApi.update(toBackendId(id), data);
            return toFrontendId(result);
        } catch {
            return undefined;
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            await CalendarNotesApi.delete(toBackendId(id));
            return true;
        } catch {
            return false;
        }
    },
};

// ===== INITIALIZATION (NO-OP since backend seeds data) =====
export function initializeDemoData() {
    // Backend handles seeding automatically via onModuleInit
    console.log('Demo data is managed by the backend');
}
