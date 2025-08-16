import React from "react";
import { useUsers } from "../api/queries";

export default function Users() {
    const { data, isLoading } = useUsers();

    return (
        <div className="container">
            <h2 style={{ marginTop: 0 }}>Users</h2>
            {isLoading ? (
                <div className="text-muted">Loading...</div>
            ) : (
                <div className="card" style={{ padding: 16 }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <Th>ID</Th>
                                    <Th>Email</Th>
                                    <Th>Risk Score</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data ?? []).map((u) => (
                                    <tr key={u.id}>
                                        <Td>{u.id}</Td>
                                        <Td>{u.email}</Td>
                                        <Td>{u.riskScore}</Td>
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
