import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Target,
    Brain,
    Zap,
    DollarSign,
    Users,
    Calendar,
    BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

const AIBusinessIntelligence = () => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock AI insights - replace with real AI analysis
    const mockInsights = [
        {
            id: 1,
            type: "opportunity",
            priority: "high",
            title: "Revenue Growth Opportunity",
            description: "Customer 'Tech Solutions Ltd' shows 40% increase in order frequency. Consider offering volume discounts.",
            impact: "₹2.5L potential additional revenue",
            action: "Create custom pricing proposal",
            confidence: 87,
            icon: TrendingUp,
            color: "text-green-600"
        },
        {
            id: 2,
            type: "risk",
            priority: "medium",
            title: "Payment Delay Risk",
            description: "ABC Corp has delayed payments by avg 15 days over last 3 months. Risk of bad debt increasing.",
            impact: "₹1.2L at risk",
            action: "Implement stricter payment terms",
            confidence: 72,
            icon: AlertTriangle,
            color: "text-orange-600"
        },
        {
            id: 3,
            type: "insight",
            priority: "low",
            title: "Seasonal Pattern Detected",
            description: "Product 'Premium Services' shows 60% higher demand in Q4. Plan inventory accordingly.",
            impact: "Optimize resource allocation",
            action: "Adjust Q4 pricing strategy",
            confidence: 94,
            icon: Calendar,
            color: "text-blue-600"
        },
        {
            id: 4,
            type: "optimization",
            priority: "high",
            title: "Pricing Optimization",
            description: "Analysis suggests 8-12% price increase possible for 'Consulting Services' without demand impact.",
            impact: "₹3.8L annual revenue increase",
            action: "Test price increase with select customers",
            confidence: 81,
            icon: DollarSign,
            color: "text-purple-600"
        }
    ];

    useEffect(() => {
        // Simulate AI processing
        setTimeout(() => {
            setInsights(mockInsights);
            setLoading(false);
        }, 2000);
    }, []);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'opportunity': return TrendingUp;
            case 'risk': return AlertTriangle;
            case 'insight': return Brain;
            case 'optimization': return Target;
            default: return BarChart3;
        }
    };

    if (loading) {
        return (
            <Card className="h-96">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        AI Business Intelligence
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
                        />
                        <p className="text-gray-600">AI analyzing your business data...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-blue-600" />
                            AI Business Intelligence
                            <Badge variant="secondary" className="ml-2">
                                <Zap className="h-3 w-3 mr-1" />
                                Live
                            </Badge>
                        </CardTitle>
                        <Button variant="outline" size="sm">
                            Refresh Analysis
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {insights.map((insight, index) => {
                            const IconComponent = insight.icon;
                            return (
                                <motion.div
                                    key={insight.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-lg ${insight.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                                            <IconComponent className={`h-5 w-5 ${insight.color}`} />
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                                                <Badge className={getPriorityColor(insight.priority)}>
                                                    {insight.priority.toUpperCase()}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {insight.confidence}% confidence
                                                </Badge>
                                            </div>

                                            <p className="text-gray-600 text-sm">{insight.description}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-green-600">{insight.impact}</p>
                                                    <p className="text-xs text-gray-500">Recommended: {insight.action}</p>
                                                </div>

                                                <Button size="sm" variant="outline">
                                                    Take Action
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AIBusinessIntelligence; 