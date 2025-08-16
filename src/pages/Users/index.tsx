import React from "react";
import { useUsers } from "../../api/queries";
import "./Users.css";

export default function Users() {
    const { data, isLoading } = useUsers();

    return (
        <div className="usersPage container">
            <h2 className="usersTitle">Users</h2>
            {isLoading ? (
                <div className="usersLoading text-muted">Loading...</div>
            ) : (
                <div className="usersCard card">
                    <div className="usersTable__wrapper">
                        <table className="usersTable">
                            <thead>
                                <tr>
                                    <Th>ID</Th>
                                    <Th>Email</Th>
                                    <Th>Risk Score</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data ?? []).map((u) => (
                                    <tr key={u.id} className="usersTable__row">
                                        <Td>{u.id}</Td>
                                        <Td>{u.email}</Td>
                                        <Td><span className="usersBadge">{u.riskScore}</span></Td>
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
        <th className="usersTable__th">{children}</th>
    );
}

function Td({ children }: { children: React.ReactNode }) {
    return (
        <td className="usersTable__td">{children}</td>
    );
}
