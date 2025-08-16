import { useQuery } from "@tanstack/react-query";

export type Transaction = {
    id: string;
    user: string;
    amount: number;
    currency: string;
    status: "approved" | "flagged" | "rejected" | "pending";
    createdAt: string;
};

export function useTransactions() {
    return useQuery({
        queryKey: ["transactions"],
        queryFn: async (): Promise<Transaction[]> => {
            await new Promise((r) => r(0));
            // mock data
            return [
                { id: "tx_1", user: "alice", amount: 1250.12, currency: "USD", status: "approved", createdAt: new Date().toISOString() },
                { id: "tx_2", user: "bob", amount: 999.5, currency: "USDT", status: "flagged", createdAt: new Date().toISOString() },
                { id: "tx_3", user: "carol", amount: 50, currency: "BTC", status: "pending", createdAt: new Date().toISOString() },
            ];
        },
        staleTime: 30_000,
    });
}

export type UserRow = {
    id: string;
    email: string;
    riskScore: number; // 0..100
};

export function useUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: async (): Promise<UserRow[]> => {
            await new Promise((r) => r(0));
            return [
                { id: "u1", email: "alice@example.com", riskScore: 12 },
                { id: "u2", email: "bob@example.com", riskScore: 71 },
                { id: "u3", email: "carol@example.com", riskScore: 38 },
            ];
        },
        staleTime: 60_000,
    });
}
