import React from "react";
import { useUsers } from "../../api/queries";
import "./Users.css";

export default function Users() {
    const { data, isLoading } = useUsers();

    return (
        <div className="users_page container">
            <h2 className="users_title">Users</h2>
            {isLoading ? (
                <div className="users_loading text-muted">Loading...</div>
            ) : (
                <div className="users_card card">
                    <div className="users_table_wrapper">
                        <table className="users_table">
                            <thead>
                                <tr>
                                    <Th>ID</Th>
                                    <Th>Email</Th>
                                    <Th>Risk Score</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data ?? []).map((u) => (
                                    <tr key={u.id} className="users_table_row">
                                        <Td>{u.id}</Td>
                                        <Td>{u.email}</Td>
                                        <Td><span className="users_badge">{u.riskScore}</span></Td>
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
        <th className="users_table_th">{children}</th>
    );
}

function Td({ children }: { children: React.ReactNode }) {
    return (
        <td className="users_table_td">{children}</td>
    );
}
