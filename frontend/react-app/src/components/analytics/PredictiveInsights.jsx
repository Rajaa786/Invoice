import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import {
    TrendingUp,
    Brain,
    Zap,
    Target,
    Calendar,
    DollarSign,
    AlertTriangle,
    CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

const PredictiveInsights = () => {
    const [selectedMetric, setSelectedMetric] = useState("revenue");

    const predictionData = {
        revenue: [
            { period: "Jan", actual: 450000, predicted: 470000, confidence: 87 },
            { period: "Feb", actual: 520000, predicted: 510000, confidence: 84 },
            { period: "Mar", actual: null, predicted: 580000, confidence: 78 },
            { period: "Apr", actual: null, predicted: 620000, confidence: 72 },
            { period: "May", actual: null, predicted: 680000, confidence: 68 }
        ],
        customers: [
            { period: "Jan", actual: 45, predicted: 47, confidence: 92 },
            { period: "Feb", actual: 52, predicted: 51, confidence: 89 },
            { period: "Mar", actual: null, predicted: 58, confidence: 85 },
            { period: "Apr", actual: null, predicted: 62, confidence: 81 },
            { period: "May", actual: null, predicted: 68, confidence: 77 }
        ]
    };

    const insights = [
        {
            type: "opportunity",
            title: "Revenue Acceleration Detected",
            description: "AI predicts 35% revenue growth in Q2 based on current trends",
            confidence: 82,
            impact: "High",
            timeframe: "Next 3 months",
            action: "Scale marketing efforts"
        },
        {
            type: "risk",
            title: "Seasonal Dip Warning",
            description: "Historical data suggests 15% revenue decline in Q3",
            confidence: 67,
            impact: "Medium",
            timeframe: "Q3 2024",
            action: "Diversify service offerings"
        },
        {
            type: "trend",
            title: "Customer Acquisition Pattern",
            description: "New customer acquisition rate increasing by 12% monthly",
            confidence: 91,
            impact: "High",
            timeframe: "Ongoing",
            action: "Optimize onboarding process"
        }
    ];

    const formatCurrency = (value) => {
        if (!value) return "₹0";
        return `₹${(value / 1000).toFixed(0)}K`;
    };

    const getInsightIcon = (type) => {
        switch (type) {
            case 'opportunity': return TrendingUp;
            case 'risk': return AlertTriangle;
            case 'trend': return Target;
            default: return Brain;
        }
    };

    const getInsightColor = (type) => {
        switch (type) {
            case 'opportunity': return 'text-green-600 bg-green-100';
            case 'risk': return 'text-red-600 bg-red-100';
            case 'trend': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-purple-600" />
                            Predictive Business Insights
                            <Badge variant="secondary" className="ml-2">
                                <Zap className="h-3 w-3 mr-1" />
                                AI Engine
                            </Badge>
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant={selectedMetric === "revenue" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedMetric("revenue")}
                            >
                                Revenue
                            </Button>
                            <Button
                                variant={selectedMetric === "customers" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedMetric("customers")}
                            >
                                Customers
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Prediction Chart */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 capitalize">
                            {selectedMetric} Prediction Model
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={predictionData[selectedMetric]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                    <YAxis
                                        tickFormatter={selectedMetric === "revenue" ? formatCurrency : (v) => v}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            selectedMetric === "revenue" ? formatCurrency(value) : value,
                                            name
                                        ]}
                                    />

                                    {/* Actual data area */}
                                    <Area
                                        type="monotone"
                                        dataKey="actual"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.6}
                                        name="Actual"
                                    />

                                    {/* Predicted data line */}
                                    <Line
                                        type="monotone"
                                        dataKey="predicted"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        strokeDasharray="5 5"
                                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                        name="Predicted"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">AI-Generated Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {insights.map((insight, index) => {
                                const IconComponent = getInsightIcon(insight.type);
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                                                <IconComponent className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {insight.confidence}% confidence
                                                </Badge>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3">{insight.description}</p>

                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Impact:</span>
                                                <Badge
                                                    className={
                                                        insight.impact === "High" ? "bg-red-100 text-red-800" :
                                                            insight.impact === "Medium" ? "bg-yellow-100 text-yellow-800" :
                                                                "bg-green-100 text-green-800"
                                                    }
                                                    size="sm"
                                                >
                                                    {insight.impact}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Timeframe:</span>
                                                <span className="font-medium">{insight.timeframe}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-gray-600 mb-1">Recommended Action:</p>
                                            <p className="text-xs font-medium">{insight.action}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PredictiveInsights; 