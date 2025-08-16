import { create } from "zustand";

export type User = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "analyst";
};

export type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    // Initialize with a default user to stay logged in
    user: {
        id: "u_1",
        name: "Fraud Admin",
        email: "admin@frauddetection.com",
        role: "admin",
    },
    isAuthenticated: true, // Already authenticated
    loading: false,
    login: async (email: string, _password: string) => {
        set({ loading: true });
        await new Promise((res) => setTimeout(res, 600));
        // Always succeed for now
        const user: User = {
            id: "u_1",
            name: "Fraud Admin",
            email,
            role: "admin",
        };
        set({ user, isAuthenticated: true, loading: false });
    },
    logout: () => set({ user: null, isAuthenticated: false }),
}));
