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
            await new Promise((r) => setTimeout(r, 500));
            // Generate dates for the past few days
            const now = new Date();
            const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
            const twoDaysAgo = new Date(now); twoDaysAgo.setDate(now.getDate() - 2);
            const threeDaysAgo = new Date(now); threeDaysAgo.setDate(now.getDate() - 3);
            
            // mock data with more entries and variety
            return [
                { id: "tx_15942", user: "alice@corp.com", amount: 1250.12, currency: "USD", status: "approved", createdAt: now.toISOString() },
                { id: "tx_15941", user: "bob@tradeco.net", amount: 999.5, currency: "USDT", status: "flagged", createdAt: now.toISOString() },
                { id: "tx_15940", user: "carol@finance.org", amount: 50, currency: "BTC", status: "pending", createdAt: now.toISOString() },
                { id: "tx_15939", user: "dave@hedge.fund", amount: 25000, currency: "USD", status: "approved", createdAt: yesterday.toISOString() },
                { id: "tx_15938", user: "eve@market.io", amount: 3120.75, currency: "EUR", status: "approved", createdAt: yesterday.toISOString() },
                { id: "tx_15937", user: "frank@invest.co", amount: 450.25, currency: "GBP", status: "rejected", createdAt: yesterday.toISOString() },
                { id: "tx_15936", user: "grace@wealth.com", amount: 12500, currency: "USD", status: "flagged", createdAt: twoDaysAgo.toISOString() },
                { id: "tx_15935", user: "heidi@banking.net", amount: 750.49, currency: "CAD", status: "pending", createdAt: twoDaysAgo.toISOString() },
                { id: "tx_15934", user: "ivan@stocks.org", amount: 8765.32, currency: "USD", status: "approved", createdAt: twoDaysAgo.toISOString() },
                { id: "tx_15933", user: "judy@capital.io", amount: 2300, currency: "AUD", status: "approved", createdAt: threeDaysAgo.toISOString() },
                { id: "tx_15932", user: "kyle@trade.com", amount: 199.99, currency: "USD", status: "rejected", createdAt: threeDaysAgo.toISOString() },
                { id: "tx_15931", user: "linda@finance.net", amount: 15000, currency: "JPY", status: "flagged", createdAt: threeDaysAgo.toISOString() },
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
