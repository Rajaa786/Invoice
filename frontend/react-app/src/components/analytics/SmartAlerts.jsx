import React, { useState } from "react";

const mockAlerts = [
    { id: 1, type: "overdue", message: "3 invoices are overdue" },
    { id: 2, type: "unpaid", message: "Customer X has unpaid dues of ₹12,000" },
    { id: 3, type: "underperforming", message: "Item Z is underperforming this month" },
];

const ICONS = {
    overdue: "⏰",
    unpaid: "💸",
    underperforming: "📉",
};

export default function SmartAlerts() {
    const [alerts, setAlerts] = useState(mockAlerts);

    const dismiss = (id) => setAlerts(alerts.filter(a => a.id !== id));

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-2">
            {alerts.map(alert => (
                <div key={alert.id} className="flex items-center bg-yellow-100 border-l-4 border-yellow-400 p-3 rounded shadow">
                    <span className="text-xl mr-2">{ICONS[alert.type]}</span>
                    <span className="flex-1 text-sm text-yellow-900">{alert.message}</span>
                    <button
                        className="ml-4 text-yellow-700 hover:text-yellow-900 text-xs font-bold"
                        onClick={() => dismiss(alert.id)}
                    >
                        Dismiss
                    </button>
                </div>
            ))}
        </div>
    );
} 