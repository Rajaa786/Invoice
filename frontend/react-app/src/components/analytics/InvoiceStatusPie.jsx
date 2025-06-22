import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const mockStatusData = [
    { name: "Paid", value: 24 },
    { name: "Unpaid", value: 10 },
    { name: "Overdue", value: 5 },
    { name: "Draft", value: 3 },
];

const COLORS = ["#22c55e", "#3b82f6", "#f59e42", "#a1a1aa"];

function CustomLegend() {
    const total = mockStatusData.reduce((sum, entry) => sum + entry.value, 0);
    return (
        <ul className="flex flex-row flex-wrap gap-6 justify-center items-center mt-2 text-xs w-full">
            {mockStatusData.map((entry, i) => (
                <li key={entry.name} className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                    <span className="font-semibold">{entry.name}</span>
                    <span className="text-gray-500">({((entry.value / total) * 100).toFixed(0)}%, {entry.value} invoices)</span>
                </li>
            ))}
        </ul>
    );
}

export default function InvoiceStatusPie() {
    return (
        <div className="bg-white rounded shadow p-4 h-64 flex flex-col items-center justify-center">
            <span className="font-semibold text-sm mb-2">Invoice Status Distribution</span>
            <div className="w-full flex flex-col items-center justify-center">
                <div className="w-40 h-40 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={mockStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={2}
                                dataKey="value"
                                labelLine={false}
                                isAnimationActive={true}
                            >
                                {mockStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} invoices`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <CustomLegend />
            </div>
        </div>
    );
} 