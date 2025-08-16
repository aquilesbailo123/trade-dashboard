import React from "react";
import { useTransactions } from "../api/queries";

export default function Transactions() {
    const { data, isLoading } = useTransactions();

    return (
        <div className="container">
            <h2 style={{ marginTop: 0 }}>Transactions</h2>
            {isLoading ? (
                <div className="text-muted">Loading...</div>
            ) : (
                <div className="card" style={{ padding: 16 }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <Th>ID</Th>
                                    <Th>User</Th>
                                    <Th>Amount</Th>
                                    <Th>Status</Th>
                                    <Th>Created</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data ?? []).map((t) => (
                                    <tr key={t.id}>
                                        <Td>{t.id}</Td>
                                        <Td>{t.user}</Td>
                                        <Td>{t.amount} {t.currency}</Td>
                                        <Td>{t.status}</Td>
                                        <Td>{new Date(t.createdAt).toLocaleString()}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return (
        <th style={{ textAlign: "left", fontWeight: 600, padding: "8px 6px", borderBottom: `1px solid var(--color-border)` }}>{children}</th>
    );
}

function Td({ children }: { children: React.ReactNode }) {
    return (
        <td style={{ padding: "8px 6px", borderBottom: `1px solid var(--color-border)` }}>{children}</td>
    );
}
