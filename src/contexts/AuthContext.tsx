// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, UserRole } from '../types/types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    register: (username: string, password: string, name: string, role?: UserRole) => Promise<boolean>;
    hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'chicken_business_users';
const CURRENT_USER_KEY = 'chicken_business_current_user';

// Default admin account
const DEFAULT_ADMIN: User = {
    id: 'admin-001',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'ผู้ดูแลระบบ',
    createdAt: new Date().toISOString(),
};

function getStoredUsers(): User[] {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    // Initialize with default admin
    localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
    return [DEFAULT_ADMIN];
}

function saveUsers(users: User[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem(CURRENT_USER_KEY);
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    }, [user]);

    const login = async (username: string, password: string): Promise<boolean> => {
        const users = getStoredUsers();
        const found = users.find(u => u.username === username && u.password === password);
        if (found) {
            setUser(found);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const register = async (
        username: string,
        password: string,
        name: string,
        role: UserRole = 'staff'
    ): Promise<boolean> => {
        const users = getStoredUsers();
        if (users.find(u => u.username === username)) {
            return false; // Username already exists
        }
        const newUser: User = {
            id: `user-${Date.now()}`,
            username,
            password,
            role,
            name,
            createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        saveUsers(users);
        return true;
    };

    const hasRole = (role: UserRole): boolean => {
        if (!user) return false;
        if (user.role === 'admin') return true; // Admin has all roles
        return user.role === role;
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login,
            logout,
            register,
            hasRole,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
