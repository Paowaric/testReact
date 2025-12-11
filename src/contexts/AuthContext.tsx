// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserRole } from '../types/types';
import { AuthApi, TokenService } from '../services/ApiService';

interface AuthUser {
    id: number;
    username: string;
    role: UserRole;
    name: string;
    createdAt: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    register: (username: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
    hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = TokenService.getUser();
            const token = TokenService.getToken();

            if (token && storedUser) {
                try {
                    // Verify token is still valid by fetching profile
                    const profile = await AuthApi.getProfile();
                    setUser(profile);
                } catch {
                    // Token invalid, clear everything
                    TokenService.clear();
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const result = await AuthApi.login(username, password);
            if (result.access_token) {
                setUser(result.user);
                return { success: true };
            }
            return { success: false, error: 'เข้าสู่ระบบไม่สำเร็จ' };
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
        }
    };

    const logout = () => {
        AuthApi.logout();
        setUser(null);
    };

    const register = async (
        username: string,
        password: string,
        name: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await AuthApi.register(username, password, name);
            return { success: true };
        } catch (error: any) {
            console.error('Register error:', error);
            return { success: false, error: error.message || 'ลงทะเบียนไม่สำเร็จ' };
        }
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
            isLoading,
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
