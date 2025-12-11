// src/services/ApiService.ts
// HTTP API Client for connecting to NestJS Backend

const API_BASE_URL = 'http://localhost:3001/api';

// Token management
const TOKEN_KEY = 'chicken_business_token';
const USER_KEY = 'chicken_business_user';

export const TokenService = {
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    },

    getUser(): any | null {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    setUser(user: any): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    removeUser(): void {
        localStorage.removeItem(USER_KEY);
    },

    clear(): void {
        this.removeToken();
        this.removeUser();
    }
};

// HTTP Client with JWT auth
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = TokenService.getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Unauthorized - clear token and redirect to login
        TokenService.clear();
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP error ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

// API Methods
export const api = {
    get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),

    post: <T>(endpoint: string, data: any) =>
        apiRequest<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    patch: <T>(endpoint: string, data: any) =>
        apiRequest<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};

// ===== AUTH API =====
export const AuthApi = {
    async login(username: string, password: string): Promise<{ access_token: string; user: any }> {
        const result = await api.post<{ access_token: string; user: any }>('/auth/login', {
            username,
            password,
        });
        if (result.access_token) {
            TokenService.setToken(result.access_token);
            TokenService.setUser(result.user);
        }
        return result;
    },

    async register(username: string, password: string, name: string): Promise<any> {
        return api.post('/auth/register', { username, password, name });
    },

    async getProfile(): Promise<any> {
        return api.get('/auth/profile');
    },

    logout(): void {
        TokenService.clear();
    },

    isAuthenticated(): boolean {
        return !!TokenService.getToken();
    },

    getCurrentUser(): any | null {
        return TokenService.getUser();
    }
};

// ===== CUSTOMERS API =====
export const CustomersApi = {
    getAll: () => api.get<any[]>('/customers'),
    getById: (id: number) => api.get<any>(`/customers/${id}`),
    getInactive: () => api.get<any[]>('/customers/inactive'),
    create: (data: any) => api.post<any>('/customers', data),
    update: (id: number, data: any) => api.patch<any>(`/customers/${id}`, data),
    delete: (id: number) => api.delete(`/customers/${id}`),
};

// ===== CHICKEN PARTS API =====
export const ChickenPartsApi = {
    getAll: () => api.get<any[]>('/chicken-parts'),
    getById: (id: number) => api.get<any>(`/chicken-parts/${id}`),
    getLowStock: () => api.get<any[]>('/chicken-parts/low-stock'),
    create: (data: any) => api.post<any>('/chicken-parts', data),
    update: (id: number, data: any) => api.patch<any>(`/chicken-parts/${id}`, data),
    adjustStock: (id: number, amount: number) =>
        api.patch<any>(`/chicken-parts/${id}/adjust-stock`, { amount }),
    delete: (id: number) => api.delete(`/chicken-parts/${id}`),
};

// ===== ORDERS API =====
export const OrdersApi = {
    getAll: () => api.get<any[]>('/orders'),
    getById: (id: number) => api.get<any>(`/orders/${id}`),
    getByCustomer: (customerId: number) => api.get<any[]>(`/orders/customer/${customerId}`),
    getTodayRevenue: () => api.get<number>('/orders/stats/today-revenue'),
    getMonthlyRevenue: () => api.get<number>('/orders/stats/monthly-revenue'),
    create: (data: any) => api.post<any>('/orders', data),
    update: (id: number, data: any) => api.patch<any>(`/orders/${id}`, data),
    delete: (id: number) => api.delete(`/orders/${id}`),
};

// ===== EMPLOYEES API =====
export const EmployeesApi = {
    getAll: () => api.get<any[]>('/employees'),
    getById: (id: number) => api.get<any>(`/employees/${id}`),
    create: (data: any) => api.post<any>('/employees', data),
    update: (id: number, data: any) => api.patch<any>(`/employees/${id}`, data),
    delete: (id: number) => api.delete(`/employees/${id}`),
};

// ===== WAGES API =====
export const WagesApi = {
    getAll: () => api.get<any[]>('/wages'),
    getById: (id: number) => api.get<any>(`/wages/${id}`),
    getByEmployee: (employeeId: number) => api.get<any[]>(`/wages/employee/${employeeId}`),
    getByDate: (date: string) => api.get<any[]>(`/wages/date/${date}`),
    getMonthlyTotal: (employeeId: number, year: number, month: number) =>
        api.get<number>(`/wages/employee/${employeeId}/monthly?year=${year}&month=${month}`),
    getTodayTotal: () => api.get<number>('/wages/stats/today'),
    getMonthTotal: () => api.get<number>('/wages/stats/month'),
    create: (data: any) => api.post<any>('/wages', data),
    update: (id: number, data: any) => api.patch<any>(`/wages/${id}`, data),
    delete: (id: number) => api.delete(`/wages/${id}`),
};

// ===== CALENDAR NOTES API =====
export const CalendarNotesApi = {
    getAll: () => api.get<any[]>('/calendar-notes'),
    getById: (id: number) => api.get<any>(`/calendar-notes/${id}`),
    getByDate: (date: string) => api.get<any[]>(`/calendar-notes/date/${date}`),
    create: (data: any) => api.post<any>('/calendar-notes', data),
    update: (id: number, data: any) => api.patch<any>(`/calendar-notes/${id}`, data),
    delete: (id: number) => api.delete(`/calendar-notes/${id}`),
};
