import React, { useState, useEffect } from 'react';
import { ActionButtons } from '../ui/action-buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const TestActionButtons = () => {
    const [testResults, setTestResults] = useState({
        items: null,
        customers: null,
        companies: null
    });
    const [loading, setLoading] = useState(false);

    const testIpcHandlers = async () => {
        setLoading(true);
        const results = {
            items: null,
            customers: null,
            companies: null
        };

        try {
            // Test Items
            console.log('Testing item handlers...');
            const itemsResult = await window.electron.getItem();
            results.items = itemsResult.success ? 'SUCCESS' : 'FAILED';
            console.log('Items result:', itemsResult);

            // Test Customers
            console.log('Testing customer handlers...');
            const customersResult = await window.electron.getCustomer();
            results.customers = customersResult.success ? 'SUCCESS' : 'FAILED';
            console.log('Customers result:', customersResult);

            // Test Companies
            console.log('Testing company handlers...');
            const companiesResult = await window.electron.getCompany();
            results.companies = companiesResult.success ? 'SUCCESS' : 'FAILED';
            console.log('Companies result:', companiesResult);

        } catch (error) {
            console.error('Error testing IPC handlers:', error);
        }

        setTestResults(results);
        setLoading(false);
    };

    useEffect(() => {
        testIpcHandlers();
    }, []);

    const handleTestAction = (action, type) => {
        console.log(`Testing ${action} action for ${type}`);
        alert(`${action} action triggered for ${type}`);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Action Buttons Test</CardTitle>
                <CardDescription>
                    Testing the action buttons functionality with IPC handlers
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* IPC Handler Status */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">IPC Handler Status</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-sm text-gray-600">Items</div>
                            <Badge
                                variant={testResults.items === 'SUCCESS' ? 'default' : 'destructive'}
                                className="mt-1"
                            >
                                {loading ? 'Testing...' : testResults.items || 'Unknown'}
                            </Badge>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600">Customers</div>
                            <Badge
                                variant={testResults.customers === 'SUCCESS' ? 'default' : 'destructive'}
                                className="mt-1"
                            >
                                {loading ? 'Testing...' : testResults.customers || 'Unknown'}
                            </Badge>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600">Companies</div>
                            <Badge
                                variant={testResults.companies === 'SUCCESS' ? 'default' : 'destructive'}
                                className="mt-1"
                            >
                                {loading ? 'Testing...' : testResults.companies || 'Unknown'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Action Buttons Tests */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Action Buttons Test</h3>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Items */}
                        <div className="border rounded-lg p-4 space-y-2">
                            <div className="font-medium text-sm">Items</div>
                            <ActionButtons
                                onView={() => handleTestAction('View', 'Item')}
                                onEdit={() => handleTestAction('Edit', 'Item')}
                                onDelete={() => handleTestAction('Delete', 'Item')}
                                viewLabel="View Item Details"
                                editLabel="Edit Item"
                                deleteLabel="Delete Item"
                                showDuplicate={false}
                                showExport={false}
                            />
                        </div>

                        {/* Customers */}
                        <div className="border rounded-lg p-4 space-y-2">
                            <div className="font-medium text-sm">Customers</div>
                            <ActionButtons
                                onView={() => handleTestAction('View', 'Customer')}
                                onEdit={() => handleTestAction('Edit', 'Customer')}
                                onDelete={() => handleTestAction('Delete', 'Customer')}
                                viewLabel="View Customer Details"
                                editLabel="Edit Customer"
                                deleteLabel="Delete Customer"
                                showDuplicate={false}
                                showExport={false}
                            />
                        </div>

                        {/* Companies */}
                        <div className="border rounded-lg p-4 space-y-2">
                            <div className="font-medium text-sm">Companies</div>
                            <ActionButtons
                                onView={() => handleTestAction('View', 'Company')}
                                onEdit={() => handleTestAction('Edit', 'Company')}
                                onDelete={() => handleTestAction('Delete', 'Company')}
                                viewLabel="View Company Details"
                                editLabel="Edit Company"
                                deleteLabel="Delete Company"
                                showDuplicate={false}
                                showExport={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Refresh Button */}
                <div className="flex justify-center">
                    <button
                        onClick={testIpcHandlers}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Testing...' : 'Refresh Tests'}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};

export default TestActionButtons; 