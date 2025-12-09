// src/services/DataService.ts
import type {
    Customer,
    ChickenPart,
    Order,
    Employee,
    DailyWage,
    CalendarNote,
    OrderItem,
} from '../types/types';

// Storage Keys
const KEYS = {
    CUSTOMERS: 'chicken_business_customers',
    CHICKEN_PARTS: 'chicken_business_chicken_parts',
    ORDERS: 'chicken_business_orders',
    EMPLOYEES: 'chicken_business_employees',
    DAILY_WAGES: 'chicken_business_daily_wages',
    CALENDAR_NOTES: 'chicken_business_calendar_notes',
};

// Helper functions
function getStorage<T>(key: string): T[] {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}

function setStorage<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ===== CUSTOMERS =====
export const CustomerService = {
    getAll(): Customer[] {
        return getStorage<Customer>(KEYS.CUSTOMERS);
    },

    getById(id: string): Customer | undefined {
        return this.getAll().find(c => c.id === id);
    },

    create(data: Omit<Customer, 'id' | 'createdAt'>): Customer {
        const customers = this.getAll();
        const newCustomer: Customer = {
            ...data,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };
        customers.push(newCustomer);
        setStorage(KEYS.CUSTOMERS, customers);
        return newCustomer;
    },

    update(id: string, data: Partial<Customer>): Customer | undefined {
        const customers = this.getAll();
        const index = customers.findIndex(c => c.id === id);
        if (index === -1) return undefined;
        customers[index] = { ...customers[index], ...data };
        setStorage(KEYS.CUSTOMERS, customers);
        return customers[index];
    },

    delete(id: string): boolean {
        const customers = this.getAll();
        const filtered = customers.filter(c => c.id !== id);
        if (filtered.length === customers.length) return false;
        setStorage(KEYS.CUSTOMERS, filtered);
        return true;
    },

    getInactiveCustomers(days: number = 30): Customer[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return this.getAll().filter(c => {
            if (!c.lastOrderDate) return true;
            return new Date(c.lastOrderDate) < cutoff;
        });
    },
};

// ===== CHICKEN PARTS =====
export const ChickenPartService = {
    getAll(): ChickenPart[] {
        return getStorage<ChickenPart>(KEYS.CHICKEN_PARTS);
    },

    getById(id: string): ChickenPart | undefined {
        return this.getAll().find(p => p.id === id);
    },

    create(data: Omit<ChickenPart, 'id' | 'createdAt'>): ChickenPart {
        const parts = this.getAll();
        const newPart: ChickenPart = {
            ...data,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };
        parts.push(newPart);
        setStorage(KEYS.CHICKEN_PARTS, parts);
        return newPart;
    },

    update(id: string, data: Partial<ChickenPart>): ChickenPart | undefined {
        const parts = this.getAll();
        const index = parts.findIndex(p => p.id === id);
        if (index === -1) return undefined;
        parts[index] = { ...parts[index], ...data };
        setStorage(KEYS.CHICKEN_PARTS, parts);
        return parts[index];
    },

    delete(id: string): boolean {
        const parts = this.getAll();
        const filtered = parts.filter(p => p.id !== id);
        if (filtered.length === parts.length) return false;
        setStorage(KEYS.CHICKEN_PARTS, filtered);
        return true;
    },

    adjustStock(id: string, amount: number): ChickenPart | undefined {
        const part = this.getById(id);
        if (!part) return undefined;
        return this.update(id, { stock: Math.max(0, part.stock + amount) });
    },

    getLowStock(threshold: number = 10): ChickenPart[] {
        return this.getAll().filter(p => p.stock < threshold);
    },
};

// ===== ORDERS =====
export const OrderService = {
    getAll(): Order[] {
        return getStorage<Order>(KEYS.ORDERS);
    },

    getById(id: string): Order | undefined {
        return this.getAll().find(o => o.id === id);
    },

    getByCustomer(customerId: string): Order[] {
        return this.getAll().filter(o => o.customerId === customerId);
    },

    create(data: {
        customerId: string;
        customerName: string;
        items: OrderItem[];
        notes?: string;
    }): Order {
        const orders = this.getAll();
        const totalAmount = data.items.reduce((sum, item) => sum + item.total, 0);
        const newOrder: Order = {
            id: generateId(),
            customerId: data.customerId,
            customerName: data.customerName,
            items: data.items,
            totalAmount,
            notes: data.notes || '',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        orders.push(newOrder);
        setStorage(KEYS.ORDERS, orders);

        // Update customer's last order date
        CustomerService.update(data.customerId, { lastOrderDate: newOrder.createdAt });

        // Reduce stock
        data.items.forEach(item => {
            ChickenPartService.adjustStock(item.chickenPartId, -item.quantity);
        });

        return newOrder;
    },

    update(id: string, data: Partial<Order>): Order | undefined {
        const orders = this.getAll();
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) return undefined;
        orders[index] = {
            ...orders[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        setStorage(KEYS.ORDERS, orders);
        return orders[index];
    },

    delete(id: string): boolean {
        const orders = this.getAll();
        const filtered = orders.filter(o => o.id !== id);
        if (filtered.length === orders.length) return false;
        setStorage(KEYS.ORDERS, filtered);
        return true;
    },

    getTodayRevenue(): number {
        const today = new Date().toISOString().split('T')[0];
        return this.getAll()
            .filter(o => o.createdAt.startsWith(today) && o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.totalAmount, 0);
    },

    getMonthlyRevenue(): number {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const prefix = `${year}-${month}`;
        return this.getAll()
            .filter(o => o.createdAt.startsWith(prefix) && o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.totalAmount, 0);
    },
};

// ===== EMPLOYEES =====
export const EmployeeService = {
    getAll(): Employee[] {
        return getStorage<Employee>(KEYS.EMPLOYEES);
    },

    getById(id: string): Employee | undefined {
        return this.getAll().find(e => e.id === id);
    },

    create(data: Omit<Employee, 'id' | 'createdAt'>): Employee {
        const employees = this.getAll();
        const newEmployee: Employee = {
            ...data,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };
        employees.push(newEmployee);
        setStorage(KEYS.EMPLOYEES, employees);
        return newEmployee;
    },

    update(id: string, data: Partial<Employee>): Employee | undefined {
        const employees = this.getAll();
        const index = employees.findIndex(e => e.id === id);
        if (index === -1) return undefined;
        employees[index] = { ...employees[index], ...data };
        setStorage(KEYS.EMPLOYEES, employees);
        return employees[index];
    },

    delete(id: string): boolean {
        const employees = this.getAll();
        const filtered = employees.filter(e => e.id !== id);
        if (filtered.length === employees.length) return false;
        setStorage(KEYS.EMPLOYEES, filtered);
        return true;
    },
};

// ===== DAILY WAGES =====
export const DailyWageService = {
    getAll(): DailyWage[] {
        return getStorage<DailyWage>(KEYS.DAILY_WAGES);
    },

    getByEmployee(employeeId: string): DailyWage[] {
        return this.getAll().filter(w => w.employeeId === employeeId);
    },

    getByDate(date: string): DailyWage[] {
        return this.getAll().filter(w => w.date === date);
    },

    create(data: Omit<DailyWage, 'id' | 'createdAt'>): DailyWage {
        const wages = this.getAll();
        const newWage: DailyWage = {
            ...data,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };
        wages.push(newWage);
        setStorage(KEYS.DAILY_WAGES, wages);
        return newWage;
    },

    update(id: string, data: Partial<DailyWage>): DailyWage | undefined {
        const wages = this.getAll();
        const index = wages.findIndex(w => w.id === id);
        if (index === -1) return undefined;
        wages[index] = { ...wages[index], ...data };
        setStorage(KEYS.DAILY_WAGES, wages);
        return wages[index];
    },

    delete(id: string): boolean {
        const wages = this.getAll();
        const filtered = wages.filter(w => w.id !== id);
        if (filtered.length === wages.length) return false;
        setStorage(KEYS.DAILY_WAGES, filtered);
        return true;
    },

    getWeeklyTotal(employeeId: string, weekStartDate: Date): number {
        const start = new Date(weekStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);

        return this.getByEmployee(employeeId)
            .filter(w => {
                const date = new Date(w.date);
                return date >= start && date < end;
            })
            .reduce((sum, w) => sum + w.amount, 0);
    },

    getMonthlyTotal(employeeId: string, year: number, month: number): number {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        return this.getByEmployee(employeeId)
            .filter(w => w.date.startsWith(prefix))
            .reduce((sum, w) => sum + w.amount, 0);
    },

    getTodayTotal(): number {
        const today = new Date().toISOString().split('T')[0];
        return this.getByDate(today).reduce((sum, w) => sum + w.amount, 0);
    },

    getMonthTotal(): number {
        const now = new Date();
        const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return this.getAll()
            .filter(w => w.date.startsWith(prefix))
            .reduce((sum, w) => sum + w.amount, 0);
    },
};

// ===== CALENDAR NOTES =====
export const CalendarNoteService = {
    getAll(): CalendarNote[] {
        return getStorage<CalendarNote>(KEYS.CALENDAR_NOTES);
    },

    getByDate(date: string): CalendarNote[] {
        return this.getAll().filter(n => n.date === date);
    },

    create(data: Omit<CalendarNote, 'id' | 'createdAt' | 'updatedAt'>): CalendarNote {
        const notes = this.getAll();
        const newNote: CalendarNote = {
            ...data,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        notes.push(newNote);
        setStorage(KEYS.CALENDAR_NOTES, notes);
        return newNote;
    },

    update(id: string, data: Partial<CalendarNote>): CalendarNote | undefined {
        const notes = this.getAll();
        const index = notes.findIndex(n => n.id === id);
        if (index === -1) return undefined;
        notes[index] = {
            ...notes[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        setStorage(KEYS.CALENDAR_NOTES, notes);
        return notes[index];
    },

    delete(id: string): boolean {
        const notes = this.getAll();
        const filtered = notes.filter(n => n.id !== id);
        if (filtered.length === notes.length) return false;
        setStorage(KEYS.CALENDAR_NOTES, filtered);
        return true;
    },
};

// ===== INITIALIZATION (Demo Data) =====
export function initializeDemoData() {
    // Only initialize if no data exists
    if (ChickenPartService.getAll().length === 0) {
        const parts = [
            { name: 'อกไก่', pricePerKg: 120, stock: 50, unit: 'กก.' },
            { name: 'สะโพก', pricePerKg: 100, stock: 40, unit: 'กก.' },
            { name: 'น่อง', pricePerKg: 90, stock: 60, unit: 'กก.' },
            { name: 'ปีก', pricePerKg: 80, stock: 45, unit: 'กก.' },
            { name: 'เครื่องใน', pricePerKg: 60, stock: 30, unit: 'กก.' },
            { name: 'หนังไก่', pricePerKg: 50, stock: 25, unit: 'กก.' },
            { name: 'ไก่ทั้งตัว', pricePerKg: 95, stock: 20, unit: 'กก.' },
            { name: 'คอไก่', pricePerKg: 40, stock: 35, unit: 'กก.' },
        ];
        parts.forEach(p => ChickenPartService.create(p));
    }

    if (CustomerService.getAll().length === 0) {
        const customers = [
            { name: 'ร้านข้าวมันไก่ลุงเจริญ', phone: '081-234-5678', address: 'ตลาดเช้า', notes: 'ลูกค้าประจำ' },
            { name: 'ร้านก๋วยเตี๋ยวป้าแดง', phone: '089-876-5432', address: 'ซอย 5', notes: 'สั่งทุกวันจันทร์' },
            { name: 'โรงแรมสุขใจ', phone: '02-123-4567', address: 'ถนนใหญ่', notes: 'สั่งเยอะ' },
        ];
        customers.forEach(c => CustomerService.create(c));
    }

    if (EmployeeService.getAll().length === 0) {
        const employees = [
            { name: 'สมชาย', phone: '081-111-1111', baseDailyWage: 400, notes: 'พนักงานอาวุโส' },
            { name: 'สมหญิง', phone: '081-222-2222', baseDailyWage: 380, notes: '' },
            { name: 'นพดล', phone: '081-333-3333', baseDailyWage: 380, notes: '' },
            { name: 'มานี', phone: '081-444-4444', baseDailyWage: 350, notes: 'พนักงานใหม่' },
            { name: 'สุภาพ', phone: '081-555-5555', baseDailyWage: 400, notes: '' },
            { name: 'วิชัย', phone: '081-666-6666', baseDailyWage: 380, notes: '' },
            { name: 'ประภา', phone: '081-777-7777', baseDailyWage: 350, notes: '' },
            { name: 'อนุชา', phone: '081-888-8888', baseDailyWage: 380, notes: '' },
        ];
        employees.forEach(e => EmployeeService.create(e));
    }
}
