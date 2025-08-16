import React from "react";
import { useTransactions } from "../../api/queries";
import "./Transactions.css";

export default function Transactions() {
    const { data, isLoading } = useTransactions();

    return (
        <div className="txPage container">
            <h2 className="txTitle">Transactions</h2>
            {isLoading ? (
                <div className="txLoading text-muted">Loading...</div>
            ) : (
                <div className="txCard card">
                    <div className="txTable__wrapper">
                        <table className="txTable">
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
                                    <tr key={t.id} className="txTable__row">
                                        <Td>{t.id}</Td>
                                        <Td>{t.user}</Td>
                                        <Td>{t.amount} {t.currency}</Td>
                                        <Td><span className={`txBadge txBadge--${t.status}`}>{t.status}</span></Td>
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
        <th className="txTable__th">{children}</th>
    );
}

function Td({ children }: { children: React.ReactNode }) {
    return (
        <td className="txTable__td">{children}</td>
    );
}
