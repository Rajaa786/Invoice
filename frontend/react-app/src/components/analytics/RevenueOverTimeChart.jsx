import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Label } from "recharts";
import { motion } from "framer-motion";

const mockDataCompany = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 18000 },
    { month: "Apr", revenue: 14000 },
    { month: "May", revenue: 20000 },
    { month: "Jun", revenue: 17000 },
];

const mockDataCustomer = [
    { month: "Jan", revenue: 10000 },
    { month: "Feb", revenue: 13000 },
    { month: "Mar", revenue: 16000 },
    { month: "Apr", revenue: 12000 },
    { month: "May", revenue: 18000 },
    { month: "Jun", revenue: 15000 },
];

const fadeIn = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } },
};

export default function RevenueOverTimeChart() {
    const [viewBy, setViewBy] = useState("company");
    const data = viewBy === "company" ? mockDataCompany : mockDataCustomer;

    return (
        <motion.div
            className="bg-white rounded shadow p-4 h-64 flex flex-col"
            variants={fadeIn}
            initial="hidden"
            animate="show"
        >
            <div className="flex items-center mb-4 gap-2">
                <span className="font-semibold text-sm">Revenue Over Time</span>
                <div className="ml-auto flex gap-2">
                    <button
                        className={`px-3 py-1 rounded transition-colors duration-150 ${viewBy === "company" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                        onClick={() => setViewBy("company")}
                    >
                        By Company
                    </button>
                    <button
                        className={`px-3 py-1 rounded transition-colors duration-150 ${viewBy === "customer" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                        onClick={() => setViewBy("customer")}
                    >
                        By Customer
                    </button>
                </div>
            </div>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="month">
                            <Label value="Month" offset={-5} position="insideBottom" />
                        </XAxis>
                        <YAxis tickFormatter={v => `₹${v / 1000}k`}>
                            <Label value="Revenue (₹)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" activeDot={{ r: 7 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
} 