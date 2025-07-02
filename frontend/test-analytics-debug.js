/**
 * Analytics Debug Test Script
 * 
 * Run this in the browser console (DevTools) to test analytics data
 */

async function testAnalyticsData() {
    console.log('🔍 Starting Analytics Debug Test...');

    try {
        // Test 1: Debug basic data
        console.log('📊 Testing basic data debug...');
        const basicData = await window.electron.analytics.debugBasicData();
        console.log('✅ Basic Data Result:', basicData);

        // Test 2: Test Summary Metrics with empty filters
        console.log('📈 Testing Summary Metrics with empty filters...');
        const summaryResult = await window.electron.analytics.getSummaryMetrics({});
        console.log('✅ Summary Metrics Result:', summaryResult);

        // Test 3: Test Invoice Status Distribution with empty filters - THE PROBLEMATIC ONE
        console.log('📊 Testing Invoice Status Distribution with empty filters (THE MISSING CALL)...');
        const statusResult = await window.electron.analytics.getInvoiceStatusDistribution({});
        console.log('✅ Invoice Status Result:', statusResult);

        // Test 4: Test with filters that have empty strings (the problematic case)
        console.log('⚠️ Testing with empty string filters (problematic case)...');
        const emptyStringFilters = {
            startDate: '',
            endDate: '',
            companyId: '',
            customerId: '',
            status: '',
            period: 'monthly'
        };
        const emptyFilterResult = await window.electron.analytics.getSummaryMetrics(emptyStringFilters);
        console.log('✅ Empty String Filters Result:', emptyFilterResult);

        // Test 5: Test Invoice Status Distribution with empty string filters
        console.log('📊 Testing Invoice Status Distribution with empty string filters...');
        const statusEmptyFilterResult = await window.electron.analytics.getInvoiceStatusDistribution(emptyStringFilters);
        console.log('✅ Invoice Status Empty String Filters Result:', statusEmptyFilterResult);

        console.log('🎉 Analytics Debug Test Complete!');

        return {
            basicData,
            summaryResult,
            statusResult,
            emptyFilterResult,
            statusEmptyFilterResult
        };

    } catch (error) {
        console.error('❌ Analytics Debug Test Failed:', error);
        throw error;
    }
}

// Test individual components directly
async function testInvoiceStatusDistributionDirectly() {
    console.log('🔍 Testing Invoice Status Distribution DIRECTLY...');

    try {
        // Test with no filters
        console.log('📊 Test 1: No filters');
        const result1 = await window.electron.analytics.getInvoiceStatusDistribution();
        console.log('✅ Result 1:', result1);

        // Test with empty object
        console.log('📊 Test 2: Empty object');
        const result2 = await window.electron.analytics.getInvoiceStatusDistribution({});
        console.log('✅ Result 2:', result2);

        // Test with empty string filters
        console.log('📊 Test 3: Empty string filters');
        const result3 = await window.electron.analytics.getInvoiceStatusDistribution({
            startDate: '',
            endDate: '',
            companyId: '',
            customerId: '',
            status: '',
            period: 'monthly'
        });
        console.log('✅ Result 3:', result3);

        console.log('🎉 Direct test complete!');

        return { result1, result2, result3 };

    } catch (error) {
        console.error('❌ Direct test failed:', error);
        throw error;
    }
}

// Auto-run the test
console.log('🚀 Analytics Debug Script Loaded.');
console.log('🔧 Run testAnalyticsData() to test all analytics functions.');
console.log('🔧 Run testInvoiceStatusDistributionDirectly() to test just the problematic function.');

// Also expose it globally for manual testing
window.testAnalyticsData = testAnalyticsData;
window.testInvoiceStatusDistributionDirectly = testInvoiceStatusDistributionDirectly; 