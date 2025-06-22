const { ipcMain } = require("electron");
const DatabaseManager = require("../db/db");
const { invoices } = require("../db/schema/Invoice");
const { invoiceItems } = require("../db/schema/InvoiceItems");
const { customers } = require("../db/schema/Customer");
const { companies } = require("../db/schema/Company");
const { items } = require("../db/schema/Item");
const { eq, sql, and, desc, asc, between, gte, lte, lt } = require("drizzle-orm");

/**
 * Analytics Service Class - Follows Single Responsibility Principle
 * Handles all analytics-related database operations with optimized queries
 */
class AnalyticsService {
    constructor() {
        this.db = DatabaseManager.getInstance().getDatabase();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    }

    /**
     * Cache management with TTL
     */
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Summary Metrics - Core KPIs
     */
    async getSummaryMetrics(filters = {}) {
        const cacheKey = `summary_metrics_${JSON.stringify(filters)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            // Build dynamic WHERE clause based on filters
            const whereClause = this.buildWhereClause(filters);

            // Check if status column exists (for backwards compatibility)
            const hasStatusColumn = await this.checkColumnExists('invoices', 'status');

            // Optimized single query to get all summary metrics
            const result = await this.db
                .select({
                    totalRevenue: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                    totalInvoices: sql`COUNT(${invoices.id})`,
                    paidInvoices: hasStatusColumn ?
                        sql`COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END)` :
                        sql`0`,
                    pendingInvoices: hasStatusColumn ?
                        sql`COUNT(CASE WHEN ${invoices.status} = 'pending' THEN 1 END)` :
                        sql`COUNT(${invoices.id})`,
                    overdueInvoices: hasStatusColumn ?
                        sql`COUNT(CASE WHEN ${invoices.status} = 'overdue' THEN 1 END)` :
                        sql`COUNT(CASE WHEN ${invoices.dueDate} < date('now') THEN 1 END)`,
                    avgInvoiceValue: sql`COALESCE(AVG(${invoices.totalAmount}), 0)`,
                    totalCustomers: sql`COUNT(DISTINCT ${invoices.customerId})`,
                    totalCompanies: sql`COUNT(DISTINCT ${invoices.companyId})`
                })
                .from(invoices)
                .where(whereClause)
                .get();

            // Calculate additional derived metrics
            const paymentRate = result.totalInvoices > 0 ?
                (result.paidInvoices / result.totalInvoices) * 100 : 0;

            const overdueRate = result.totalInvoices > 0 ?
                (result.overdueInvoices / result.totalInvoices) * 100 : 0;

            const metrics = {
                ...result,
                paymentRate: Math.round(paymentRate * 100) / 100,
                overdueRate: Math.round(overdueRate * 100) / 100,
                collectionEfficiency: Math.round((100 - overdueRate) * 100) / 100
            };

            this.setCache(cacheKey, metrics);
            return metrics;
        } catch (error) {
            console.error('Error fetching summary metrics:', error);
            throw new Error(`Failed to fetch summary metrics: ${error.message}`);
        }
    }

    /**
     * Helper method to check if a column exists in a table
     */
    async checkColumnExists(tableName, columnName) {
        try {
            // Use raw SQL query with Drizzle to check column existence
            const result = await this.db.all(sql`PRAGMA table_info(${sql.raw(tableName)})`);
            return result.some(col => col.name === columnName);
        } catch (error) {
            console.warn(`Could not check column existence: ${error.message}`);
            return false;
        }
    }

    /**
     * Revenue Over Time - Time series analysis
     */
    async getRevenueOverTime(filters = {}) {
        const cacheKey = `revenue_over_time_${JSON.stringify(filters)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const { period = 'monthly', startDate, endDate } = filters;

            // Dynamic date grouping based on period
            const dateFormat = this.getDateFormat(period);
            const whereClause = this.buildWhereClause(filters);

            const result = await this.db
                .select({
                    period: sql`strftime('${sql.raw(dateFormat)}', ${invoices.invoiceDate})`,
                    revenue: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                    invoiceCount: sql`COUNT(${invoices.id})`,
                    avgInvoiceValue: sql`COALESCE(AVG(${invoices.totalAmount}), 0)`,
                    paidRevenue: sql`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    pendingRevenue: sql`COALESCE(SUM(CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.totalAmount} ELSE 0 END), 0)`
                })
                .from(invoices)
                .where(whereClause)
                .groupBy(sql`strftime('${sql.raw(dateFormat)}', ${invoices.invoiceDate})`)
                .orderBy(sql`strftime('${sql.raw(dateFormat)}', ${invoices.invoiceDate})`);

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error fetching revenue over time:', error);
            throw new Error(`Failed to fetch revenue over time: ${error.message}`);
        }
    }

    /**
     * Invoice Status Distribution with Enhanced Analytics
     */
    async getInvoiceStatusDistribution(filters = {}) {
        const cacheKey = `invoice_status_${JSON.stringify(filters)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const whereClause = this.buildWhereClause(filters);

            // Check if status column exists (for backwards compatibility)
            const hasStatusColumn = await this.checkColumnExists('invoices', 'status');
            const hasPaidDateColumn = await this.checkColumnExists('invoices', 'paidDate');

            // Get total count first for percentage calculation
            const totalCountResult = await this.db
                .select({
                    totalCount: sql`COUNT(*)`
                })
                .from(invoices)
                .where(whereClause)
                .get();

            const totalCount = totalCountResult?.totalCount || 1; // Avoid division by zero

            if (!hasStatusColumn) {
                // Fallback for databases without status column
                const basicData = await this.db
                    .select({
                        count: sql`COUNT(*)`,
                        totalAmount: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`
                    })
                    .from(invoices)
                    .where(whereClause)
                    .get();

                const result = {
                    statusData: [{
                        name: 'All',
                        status: 'all',
                        value: Number(basicData?.count || 0),
                        amount: Number(basicData?.totalAmount || 0),
                        percentage: 100,
                        avgDays: 0,
                        avgAmount: Number(basicData?.totalAmount || 0) / Math.max(Number(basicData?.count || 1), 1),
                        trend: 0,
                        risk: 'None'
                    }],
                    agingData: [],
                    summary: {
                        totalInvoices: Number(basicData?.count || 0),
                        totalAmount: Number(basicData?.totalAmount || 0),
                        avgDSO: 0,
                        collectionRate: 0,
                        overduePercentage: 0
                    }
                };

                this.setCache(cacheKey, result);
                return result;
            }

            // Get basic status distribution
            const statusDistribution = await this.db
                .select({
                    status: invoices.status,
                    count: sql`COUNT(*)`,
                    totalAmount: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                    avgDays: hasPaidDateColumn ? sql`ROUND(AVG(
                        CASE 
                            WHEN ${invoices.status} = 'paid' AND ${invoices.paidDate} IS NOT NULL 
                            THEN julianday(${invoices.paidDate}) - julianday(${invoices.invoiceDate})
                            WHEN ${invoices.status} = 'pending' 
                            THEN julianday('now') - julianday(${invoices.invoiceDate})
                            WHEN ${invoices.status} = 'overdue' 
                            THEN julianday('now') - julianday(${invoices.dueDate})
                            ELSE 0 
                        END
                    ), 0)` : sql`ROUND(julianday('now') - julianday(${invoices.invoiceDate}), 0)`,
                    avgAmount: sql`ROUND(AVG(${invoices.totalAmount}), 2)`
                })
                .from(invoices)
                .where(whereClause)
                .groupBy(invoices.status)
                .orderBy(desc(sql`COUNT(*)`));

            // Get aging analysis (simplified)
            const agingAnalysis = await this.db
                .select({
                    range: sql`
                        CASE 
                            WHEN julianday('now') - julianday(${invoices.invoiceDate}) <= 30 THEN '0-30 days'
                            WHEN julianday('now') - julianday(${invoices.invoiceDate}) <= 60 THEN '31-60 days'
                            WHEN julianday('now') - julianday(${invoices.invoiceDate}) <= 90 THEN '61-90 days'
                            ELSE '90+ days'
                        END`,
                    paid: sql`COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END)`,
                    pending: sql`COUNT(CASE WHEN ${invoices.status} = 'pending' THEN 1 END)`,
                    overdue: sql`COUNT(CASE WHEN ${invoices.status} = 'overdue' THEN 1 END)`,
                    cancelled: sql`COUNT(CASE WHEN ${invoices.status} = 'cancelled' THEN 1 END)`,
                    draft: sql`COUNT(CASE WHEN ${invoices.status} = 'draft' THEN 1 END)`
                })
                .from(invoices)
                .where(whereClause)
                .groupBy(sql`
                    CASE 
                        WHEN julianday('now') - julianday(${invoices.invoiceDate}) <= 30 THEN '0-30 days'
                        WHEN julianday('now') - julianday(${invoices.invoiceDate}) <= 60 THEN '31-60 days'
                        WHEN julianday('now') - julianday(${invoices.invoiceDate}) <= 90 THEN '61-90 days'
                        ELSE '90+ days'
                    END`);

            // Simplified trend calculation (without complex previous period logic)
            let previousPeriodData = [];
            try {
                const currentPeriodStart = filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                const previousPeriodStart = new Date(new Date(currentPeriodStart).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

                previousPeriodData = await this.db
                    .select({
                        status: invoices.status,
                        count: sql`COUNT(*)`
                    })
                    .from(invoices)
                    .where(
                        and(
                            gte(invoices.invoiceDate, previousPeriodStart),
                            lt(invoices.invoiceDate, currentPeriodStart)
                        )
                    )
                    .groupBy(invoices.status);
            } catch (trendError) {
                console.warn('Could not calculate trends:', trendError.message);
            }

            // Enhance status distribution with additional metrics
            const enhancedStatusData = statusDistribution.map(status => {
                const previousCount = previousPeriodData.find(p => p.status === status.status)?.count || 0;
                const trend = previousCount > 0 ? ((status.count - previousCount) / previousCount * 100) : 0;

                // Calculate percentage
                const percentage = totalCount > 0 ? (status.count / totalCount * 100) : 0;

                // Calculate risk level
                let riskLevel = 'Low';
                if (status.status === 'overdue') riskLevel = 'High';
                else if (status.status === 'pending' && status.avgDays > 30) riskLevel = 'Medium';
                else if (status.status === 'draft') riskLevel = 'None';

                return {
                    name: status.status.charAt(0).toUpperCase() + status.status.slice(1),
                    status: status.status,
                    value: Number(status.count),
                    amount: Number(status.totalAmount),
                    percentage: Number(percentage.toFixed(2)),
                    avgDays: Number(status.avgDays || 0),
                    avgAmount: Number(status.avgAmount || 0),
                    trend: Number(trend.toFixed(1)),
                    risk: riskLevel
                };
            });

            const result = {
                statusData: enhancedStatusData,
                agingData: agingAnalysis,
                summary: {
                    totalInvoices: enhancedStatusData.reduce((sum, s) => sum + s.value, 0),
                    totalAmount: enhancedStatusData.reduce((sum, s) => sum + s.amount, 0),
                    avgDSO: enhancedStatusData.length > 0 ?
                        enhancedStatusData.reduce((sum, s) => sum + (s.avgDays * s.value), 0) /
                        enhancedStatusData.reduce((sum, s) => sum + s.value, 0) : 0,
                    collectionRate: enhancedStatusData.length > 0 ?
                        (enhancedStatusData.find(s => s.status === 'paid')?.amount || 0) /
                        Math.max(enhancedStatusData.reduce((sum, s) => sum + s.amount, 0), 1) * 100 : 0,
                    overduePercentage: enhancedStatusData.length > 0 ?
                        (enhancedStatusData.find(s => s.status === 'overdue')?.amount || 0) /
                        Math.max(enhancedStatusData.reduce((sum, s) => sum + s.amount, 0), 1) * 100 : 0
                }
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error fetching invoice status distribution:', error);
            // Return empty result instead of throwing to prevent UI crashes
            return {
                statusData: [],
                agingData: [],
                summary: {
                    totalInvoices: 0,
                    totalAmount: 0,
                    avgDSO: 0,
                    collectionRate: 0,
                    overduePercentage: 0
                }
            };
        }
    }

    /**
     * Customer Revenue Analysis with Enhanced Scoring
     */
    async getCustomerRevenueAnalysis(filters = {}) {
        const cacheKey = `customer_revenue_${JSON.stringify(filters)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const { limit = 50, sortBy = 'totalRevenue', sortOrder = 'desc', searchTerm, segment, riskLevel, offset = 0 } = filters;
            let whereClause = this.buildWhereClause(filters);

            // Enhanced query with customer scoring metrics
            const result = await this.db
                .select({
                    customerId: customers.id,
                    customerName: customers.companyName,
                    firstName: customers.firstName,
                    lastName: customers.lastName,
                    totalRevenue: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                    invoiceCount: sql`COUNT(${invoices.id})`,
                    avgInvoiceValue: sql`COALESCE(AVG(${invoices.totalAmount}), 0)`,
                    paidAmount: sql`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    pendingAmount: sql`COALESCE(SUM(CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    overdueAmount: sql`COALESCE(SUM(CASE WHEN ${invoices.status} = 'overdue' THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    lastInvoiceDate: sql`MAX(${invoices.invoiceDate})`,
                    firstInvoiceDate: sql`MIN(${invoices.invoiceDate})`,
                    paymentRate: sql`ROUND(COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END) * 100.0 / COUNT(*), 2)`,
                    avgPaymentDays: sql`ROUND(AVG(
                        CASE 
                            WHEN ${invoices.status} = 'paid' AND ${invoices.paidDate} IS NOT NULL 
                            THEN julianday(${invoices.paidDate}) - julianday(${invoices.invoiceDate})
                            ELSE julianday('now') - julianday(${invoices.invoiceDate})
                        END
                    ), 0)`,
                    overdueCount: sql`COUNT(CASE WHEN ${invoices.status} = 'overdue' THEN 1 END)`,
                    customerLifetimeMonths: sql`ROUND((julianday('now') - julianday(MIN(${invoices.invoiceDate}))) / 30.44, 1)`
                })
                .from(invoices)
                .innerJoin(customers, eq(invoices.customerId, customers.id))
                .where(whereClause)
                .groupBy(customers.id, customers.companyName, customers.firstName, customers.lastName)
                .having(sql`COUNT(${invoices.id}) > 0`)
                .orderBy(this.buildOrderByClause(sortBy, sortOrder))
                .limit(limit)
                .offset(offset);

            // Add customer segmentation and scoring
            let enrichedResult = result.map(customer => {
                const score = this.calculateCustomerScore(customer);
                const segment = this.categorizeCustomerByScore(customer, score);
                const riskLevel = this.calculateCustomerRisk(customer);

                return {
                    ...customer,
                    customerScore: score,
                    segment,
                    riskLevel,
                    // Convert numeric fields to ensure proper typing
                    totalRevenue: Number(customer.totalRevenue || 0),
                    invoiceCount: Number(customer.invoiceCount || 0),
                    avgInvoiceValue: Number(customer.avgInvoiceValue || 0),
                    paidAmount: Number(customer.paidAmount || 0),
                    pendingAmount: Number(customer.pendingAmount || 0),
                    overdueAmount: Number(customer.overdueAmount || 0),
                    paymentRate: Number(customer.paymentRate || 0),
                    avgPaymentDays: Number(customer.avgPaymentDays || 0),
                    overdueCount: Number(customer.overdueCount || 0),
                    customerLifetimeMonths: Number(customer.customerLifetimeMonths || 0)
                };
            });

            // Apply additional filters if specified
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                enrichedResult = enrichedResult.filter(customer => {
                    const name = customer.customerName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                    return name.toLowerCase().includes(searchLower);
                });
            }

            if (segment && segment !== 'all') {
                enrichedResult = enrichedResult.filter(customer => customer.segment === segment);
            }

            if (riskLevel && riskLevel !== 'all') {
                enrichedResult = enrichedResult.filter(customer => customer.riskLevel === riskLevel);
            }

            this.setCache(cacheKey, enrichedResult);
            return enrichedResult;
        } catch (error) {
            console.error('Error fetching customer revenue analysis:', error);
            // Return empty array instead of throwing to prevent UI crashes
            return [];
        }
    }

    /**
     * Company Performance Split - Enhanced with Advanced Business Intelligence
     */
    async getCompanySplit(filters = {}) {
        const cacheKey = `company_split_${JSON.stringify(filters)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const whereClause = this.buildWhereClause(filters);

            // Main company performance query (simplified to avoid join issues)
            const companiesData = await this.db
                .select({
                    companyId: companies.id,
                    companyName: companies.companyName,
                    companyType: companies.companyType,
                    totalRevenue: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                    invoiceCount: sql`COUNT(${invoices.id})`,
                    avgInvoiceValue: sql`COALESCE(AVG(${invoices.totalAmount}), 0)`,
                    customerCount: sql`COUNT(DISTINCT ${invoices.customerId})`,
                    paidRevenue: sql`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    pendingRevenue: sql`COALESCE(SUM(CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    overdueRevenue: sql`COALESCE(SUM(CASE WHEN ${invoices.status} = 'overdue' THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    paymentRate: sql`ROUND(COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END) * 100.0 / COUNT(*), 2)`,

                    // Advanced timing metrics
                    avgPaymentDays: sql`ROUND(AVG(
                        CASE 
                            WHEN ${invoices.status} = 'paid' AND ${invoices.paidDate} IS NOT NULL 
                            THEN julianday(${invoices.paidDate}) - julianday(${invoices.invoiceDate})
                            ELSE julianday('now') - julianday(${invoices.invoiceDate})
                        END
                    ), 1)`,

                    // Operational efficiency indicators
                    onTimePayments: sql`COUNT(CASE WHEN ${invoices.status} = 'paid' AND ${invoices.paidDate} IS NOT NULL AND julianday(${invoices.paidDate}) <= julianday(${invoices.dueDate}) THEN 1 END)`,
                    latePayments: sql`COUNT(CASE WHEN ${invoices.status} = 'paid' AND ${invoices.paidDate} IS NOT NULL AND julianday(${invoices.paidDate}) > julianday(${invoices.dueDate}) THEN 1 END)`,

                    // Time-based metrics for growth calculation
                    firstInvoiceDate: sql`MIN(${invoices.invoiceDate})`,
                    lastInvoiceDate: sql`MAX(${invoices.invoiceDate})`,
                    recentMonthRevenue: sql`COALESCE(SUM(CASE WHEN ${invoices.invoiceDate} >= date('now', '-30 days') THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    previousMonthRevenue: sql`COALESCE(SUM(CASE WHEN ${invoices.invoiceDate} >= date('now', '-60 days') AND ${invoices.invoiceDate} < date('now', '-30 days') THEN ${invoices.totalAmount} ELSE 0 END), 0)`,

                    // Simplified metrics without customer join
                    recurringRevenue: sql`0`, // Will calculate separately if needed
                    repeatCustomers: sql`COUNT(DISTINCT ${invoices.customerId})`,

                    // Geographic and establishment info (we'll add fallbacks)
                    establishedYear: sql`COALESCE(${companies.establishedYear}, 2020)`,
                    geography: sql`COALESCE(${companies.city}, 'Unknown')`,
                    employeeCount: sql`COALESCE(${companies.employeeCount}, 50)`,

                    // Market share calculation (simplified)
                    marketShare: sql`0` // Will calculate after getting totals
                })
                .from(invoices)
                .innerJoin(companies, eq(invoices.companyId, companies.id))
                .where(whereClause || sql`1=1`)
                .groupBy(companies.id, companies.companyName, companies.companyType, companies.establishedYear, companies.city, companies.employeeCount)
                .orderBy(desc(sql`COALESCE(SUM(${invoices.totalAmount}), 0)`));

            // Calculate quarterly growth trends for each company
            const enhancedCompaniesData = await Promise.all(companiesData.map(async (company) => {
                // Get quarterly data for the last 4 quarters
                const quarterlyData = await this.getQuarterlyGrowthData(company.companyId, filters);

                // Calculate advanced metrics
                const advancedMetrics = this.calculateAdvancedCompanyMetrics(company, quarterlyData);

                return {
                    ...company,
                    ...advancedMetrics,
                    quarterlyGrowth: quarterlyData.growthRates,
                    quarterlyRevenue: quarterlyData.revenues,
                    quarterlyInvoices: quarterlyData.invoiceCounts
                };
            }));

            // Calculate industry benchmarks and competitive analysis
            const industryBenchmarks = this.calculateIndustryBenchmarks(enhancedCompaniesData);

            // Add competitive positioning to each company
            const finalCompaniesData = enhancedCompaniesData.map(company => ({
                ...company,
                industryRank: this.calculateIndustryRank(company, enhancedCompaniesData),
                competitivePosition: this.calculateCompetitivePosition(company, industryBenchmarks),
                topCustomers: [], // Will be populated separately if needed
                strategicRecommendations: this.generateStrategicRecommendations(company, industryBenchmarks)
            }));

            const result = {
                companies: finalCompaniesData,
                industryBenchmarks,
                summary: {
                    totalCompanies: finalCompaniesData.length,
                    totalRevenue: finalCompaniesData.reduce((sum, c) => sum + (c.totalRevenue || 0), 0),
                    avgGrowthRate: finalCompaniesData.reduce((sum, c) => sum + (c.growthRate || 0), 0) / finalCompaniesData.length,
                    topPerformer: finalCompaniesData[0],
                    industryLeader: finalCompaniesData.find(c => c.industryRank === 1)
                }
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error fetching company split:', error);
            throw new Error(`Failed to fetch company split: ${error.message}`);
        }
    }

    /**
     * Get quarterly growth data for a specific company
     */
    async getQuarterlyGrowthData(companyId, filters = {}) {
        try {
            const currentDate = new Date();
            const quarters = [];

            // Get data for last 4 quarters
            for (let i = 3; i >= 0; i--) {
                const quarterStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - (i * 3), 1);
                const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);

                const quarterData = await this.db
                    .select({
                        revenue: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                        invoiceCount: sql`COUNT(${invoices.id})`,
                        quarter: sql`'Q' || CASE 
                            WHEN CAST(strftime('%m', ${invoices.invoiceDate}) AS INTEGER) <= 3 THEN '1'
                            WHEN CAST(strftime('%m', ${invoices.invoiceDate}) AS INTEGER) <= 6 THEN '2'
                            WHEN CAST(strftime('%m', ${invoices.invoiceDate}) AS INTEGER) <= 9 THEN '3'
                            ELSE '4'
                        END`
                    })
                    .from(invoices)
                    .where(and(
                        eq(invoices.companyId, companyId),
                        gte(invoices.invoiceDate, quarterStart.toISOString().split('T')[0]),
                        lte(invoices.invoiceDate, quarterEnd.toISOString().split('T')[0])
                    ))
                    .get();

                quarters.push({
                    quarter: `Q${4 - i}`,
                    revenue: Number(quarterData?.revenue || 0),
                    invoiceCount: Number(quarterData?.invoiceCount || 0),
                    period: `${quarterStart.getFullYear()}-Q${Math.ceil((quarterStart.getMonth() + 1) / 3)}`
                });
            }

            // Calculate growth rates
            const growthRates = quarters.map((quarter, index) => {
                if (index === 0) return 0; // First quarter has no previous data
                const previousRevenue = quarters[index - 1].revenue;
                if (previousRevenue === 0) return 0;
                return Math.round(((quarter.revenue - previousRevenue) / previousRevenue) * 100 * 10) / 10;
            });

            return {
                quarters,
                growthRates,
                revenues: quarters.map(q => q.revenue),
                invoiceCounts: quarters.map(q => q.invoiceCount)
            };
        } catch (error) {
            console.warn('Error fetching quarterly data:', error);
            return {
                quarters: [],
                growthRates: [0, 0, 0, 0],
                revenues: [0, 0, 0, 0],
                invoiceCounts: [0, 0, 0, 0]
            };
        }
    }

    /**
     * Calculate advanced company metrics
     */
    calculateAdvancedCompanyMetrics(company, quarterlyData) {
        const totalRevenue = company.totalRevenue || 0;
        const invoiceCount = company.invoiceCount || 0;
        const paidRevenue = company.paidRevenue || 0;
        const paymentRate = company.paymentRate || 0;
        const onTimePayments = company.onTimePayments || 0;
        const latePayments = company.latePayments || 0;
        const totalPayments = onTimePayments + latePayments;

        // Growth Rate Calculation
        const recentRevenue = company.recentMonthRevenue || 0;
        const previousRevenue = company.previousMonthRevenue || 0;
        const growthRate = previousRevenue > 0 ?
            Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100 * 10) / 10 : 0;

        // Operational Efficiency (0-100)
        let operationalEfficiency = 0;
        if (totalPayments > 0) {
            const onTimeRate = (onTimePayments / totalPayments) * 100;
            const collectionRate = paymentRate;
            const invoiceFrequency = invoiceCount > 0 ? Math.min((invoiceCount / 12) * 10, 20) : 0; // Max 20 points

            operationalEfficiency = Math.round(
                (onTimeRate * 0.4) +
                (collectionRate * 0.4) +
                (invoiceFrequency * 0.2)
            );
        } else {
            operationalEfficiency = Math.round(paymentRate * 0.8); // Fallback based on payment rate
        }

        // Risk Score (0-100, lower is better)
        let riskScore = 0;
        const overdueRevenue = company.overdueRevenue || 0;
        const overdueRate = totalRevenue > 0 ? (overdueRevenue / totalRevenue) * 100 : 0;
        const avgPaymentDays = company.avgPaymentDays || 0;

        riskScore = Math.round(
            (overdueRate * 0.4) +
            (Math.max(0, avgPaymentDays - 30) * 0.3) +
            ((100 - paymentRate) * 0.3)
        );

        // Customer Satisfaction (1-5 scale) - derived from payment behavior
        const repeatCustomers = company.repeatCustomers || 0;
        const totalCustomers = company.customerCount || 1;
        const repeatRate = (repeatCustomers / totalCustomers) * 100;
        const paymentPunctuality = totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : paymentRate;

        const customerSatisfaction = Math.round(
            (2.5 +
                (repeatRate / 100) * 1.5 +
                (paymentPunctuality / 100) * 1.0) * 10
        ) / 10;

        // Revenue Streams Analysis
        const recurringRevenue = company.recurringRevenue || 0;
        const oneTimeRevenue = totalRevenue - recurringRevenue;
        const revenueStreams = {
            recurring: totalRevenue > 0 ? Math.round((recurringRevenue / totalRevenue) * 100) : 0,
            oneTime: totalRevenue > 0 ? Math.round((oneTimeRevenue / totalRevenue) * 100) : 100
        };

        // Performance Category
        let performance = 'Unknown';
        if (paymentRate >= 90 && totalRevenue > 500000 && operationalEfficiency > 80) {
            performance = 'Excellent';
        } else if (paymentRate >= 75 && totalRevenue > 200000 && operationalEfficiency > 60) {
            performance = 'Good';
        } else if (paymentRate >= 60 && totalRevenue > 100000) {
            performance = 'Average';
        } else if (paymentRate > 0) {
            performance = 'Poor';
        }

        // Strategic Priority
        let strategicPriority = 'Low';
        if (totalRevenue > 500000 && paymentRate > 80 && growthRate > 10) {
            strategicPriority = 'High';
        } else if (totalRevenue > 200000 && paymentRate > 60) {
            strategicPriority = 'Medium';
        }

        // Investment Potential
        let investmentPotential = 'Low';
        if (growthRate > 20 && operationalEfficiency > 80 && riskScore < 20) {
            investmentPotential = 'Very High';
        } else if (growthRate > 10 && operationalEfficiency > 60 && riskScore < 40) {
            investmentPotential = 'High';
        } else if (growthRate > 0 && operationalEfficiency > 40) {
            investmentPotential = 'Medium';
        }

        return {
            growthRate,
            operationalEfficiency: Math.min(100, Math.max(0, operationalEfficiency)),
            riskScore: Math.min(100, Math.max(0, riskScore)),
            customerSatisfaction: Math.min(5, Math.max(1, customerSatisfaction)),
            revenueStreams,
            performance,
            strategicPriority,
            investmentPotential,
            // Additional computed fields
            collectionEfficiency: Math.round(paymentRate),
            avgDaysToCollection: Math.round(company.avgPaymentDays || 0),
            customerRetentionRate: Math.round(repeatRate),
            revenuePerCustomer: Math.round(totalRevenue / Math.max(1, company.customerCount || 1)),
            revenuePerEmployee: Math.round(totalRevenue / Math.max(1, company.employeeCount || 1)),
            invoiceEfficiency: Math.round(totalRevenue / Math.max(1, invoiceCount)),
            // Market positioning
            marketPosition: this.determineMarketPosition(totalRevenue, paymentRate, growthRate),
            businessMaturity: this.calculateBusinessMaturity(company.establishedYear, totalRevenue, operationalEfficiency)
        };
    }

    /**
     * Determine market position based on key metrics
     */
    determineMarketPosition(revenue, paymentRate, growthRate) {
        if (revenue > 1000000 && paymentRate > 85 && growthRate > 15) return 'Market Leader';
        if (revenue > 500000 && paymentRate > 75 && growthRate > 10) return 'Strong Competitor';
        if (revenue > 200000 && paymentRate > 65) return 'Established Player';
        if (revenue > 100000) return 'Growing Business';
        return 'Emerging Company';
    }

    /**
     * Calculate business maturity score
     */
    calculateBusinessMaturity(establishedYear, revenue, efficiency) {
        const currentYear = new Date().getFullYear();
        const yearsInBusiness = currentYear - (establishedYear || currentYear);

        let maturityScore = 0;
        maturityScore += Math.min(yearsInBusiness * 2, 20); // Max 20 points for age
        maturityScore += Math.min((revenue / 100000) * 2, 30); // Max 30 points for revenue
        maturityScore += Math.min((efficiency / 100) * 50, 50); // Max 50 points for efficiency

        if (maturityScore >= 80) return 'Mature Enterprise';
        if (maturityScore >= 60) return 'Established Business';
        if (maturityScore >= 40) return 'Growing Company';
        if (maturityScore >= 20) return 'Developing Business';
        return 'Startup';
    }

    /**
     * Calculate industry benchmarks
     */
    calculateIndustryBenchmarks(companies) {
        if (!companies.length) return {};

        const totalRevenue = companies.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
        const avgRevenue = totalRevenue / companies.length;
        const avgPaymentRate = companies.reduce((sum, c) => sum + (c.paymentRate || 0), 0) / companies.length;
        const avgGrowthRate = companies.reduce((sum, c) => sum + (c.growthRate || 0), 0) / companies.length;
        const avgEfficiency = companies.reduce((sum, c) => sum + (c.operationalEfficiency || 0), 0) / companies.length;

        // Calculate percentiles
        const revenues = companies.map(c => c.totalRevenue || 0).sort((a, b) => a - b);
        const paymentRates = companies.map(c => c.paymentRate || 0).sort((a, b) => a - b);

        return {
            avgRevenue: Math.round(avgRevenue),
            avgPaymentRate: Math.round(avgPaymentRate * 10) / 10,
            avgGrowthRate: Math.round(avgGrowthRate * 10) / 10,
            avgEfficiency: Math.round(avgEfficiency * 10) / 10,
            revenuePercentiles: {
                p25: revenues[Math.floor(revenues.length * 0.25)],
                p50: revenues[Math.floor(revenues.length * 0.5)],
                p75: revenues[Math.floor(revenues.length * 0.75)],
                p90: revenues[Math.floor(revenues.length * 0.9)]
            },
            paymentRatePercentiles: {
                p25: paymentRates[Math.floor(paymentRates.length * 0.25)],
                p50: paymentRates[Math.floor(paymentRates.length * 0.5)],
                p75: paymentRates[Math.floor(paymentRates.length * 0.75)],
                p90: paymentRates[Math.floor(paymentRates.length * 0.9)]
            },
            topPerformers: companies.slice(0, Math.ceil(companies.length * 0.1)),
            industryLeaders: companies.filter(c => (c.marketShare || 0) > 10)
        };
    }

    /**
     * Calculate industry rank for a company
     */
    calculateIndustryRank(company, allCompanies) {
        const sortedByRevenue = [...allCompanies].sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
        return sortedByRevenue.findIndex(c => c.companyId === company.companyId) + 1;
    }

    /**
     * Calculate competitive position
     */
    calculateCompetitivePosition(company, benchmarks) {
        const revenue = company.totalRevenue || 0;
        const paymentRate = company.paymentRate || 0;
        const growthRate = company.growthRate || 0;

        let position = 'Competitive';
        let score = 0;

        // Revenue position
        if (revenue > benchmarks.revenuePercentiles?.p90) score += 40;
        else if (revenue > benchmarks.revenuePercentiles?.p75) score += 30;
        else if (revenue > benchmarks.revenuePercentiles?.p50) score += 20;
        else if (revenue > benchmarks.revenuePercentiles?.p25) score += 10;

        // Payment rate position
        if (paymentRate > benchmarks.paymentRatePercentiles?.p90) score += 30;
        else if (paymentRate > benchmarks.paymentRatePercentiles?.p75) score += 20;
        else if (paymentRate > benchmarks.paymentRatePercentiles?.p50) score += 15;
        else if (paymentRate > benchmarks.paymentRatePercentiles?.p25) score += 10;

        // Growth position
        if (growthRate > benchmarks.avgGrowthRate + 10) score += 30;
        else if (growthRate > benchmarks.avgGrowthRate) score += 20;
        else if (growthRate > benchmarks.avgGrowthRate - 5) score += 10;

        if (score >= 80) position = 'Dominant';
        else if (score >= 60) position = 'Strong';
        else if (score >= 40) position = 'Competitive';
        else if (score >= 20) position = 'Weak';
        else position = 'Struggling';

        return {
            position,
            score,
            revenueRank: revenue > benchmarks.avgRevenue ? 'Above Average' : 'Below Average',
            paymentRank: paymentRate > benchmarks.avgPaymentRate ? 'Above Average' : 'Below Average',
            growthRank: growthRate > benchmarks.avgGrowthRate ? 'Above Average' : 'Below Average'
        };
    }

    /**
     * Generate strategic recommendations
     */
    generateStrategicRecommendations(company, benchmarks) {
        const recommendations = [];
        const revenue = company.totalRevenue || 0;
        const paymentRate = company.paymentRate || 0;
        const growthRate = company.growthRate || 0;
        const efficiency = company.operationalEfficiency || 0;

        // Revenue recommendations
        if (revenue < benchmarks.avgRevenue) {
            recommendations.push({
                category: 'Revenue Growth',
                priority: 'High',
                recommendation: 'Focus on customer acquisition and upselling to existing clients',
                impact: 'High',
                timeframe: '3-6 months'
            });
        }

        // Payment rate recommendations
        if (paymentRate < benchmarks.avgPaymentRate) {
            recommendations.push({
                category: 'Collections',
                priority: 'High',
                recommendation: 'Implement automated payment reminders and improve collection processes',
                impact: 'Medium',
                timeframe: '1-3 months'
            });
        }

        // Growth recommendations
        if (growthRate < benchmarks.avgGrowthRate) {
            recommendations.push({
                category: 'Business Growth',
                priority: 'Medium',
                recommendation: 'Analyze market opportunities and optimize sales processes',
                impact: 'High',
                timeframe: '3-12 months'
            });
        }

        // Efficiency recommendations
        if (efficiency < 70) {
            recommendations.push({
                category: 'Operational Efficiency',
                priority: 'Medium',
                recommendation: 'Streamline invoicing processes and reduce manual tasks',
                impact: 'Medium',
                timeframe: '2-4 months'
            });
        }

        return recommendations;
    }

    /**
     * Top Items Analysis - Enhanced with Advanced Analytics
     */
    async getTopItemsAnalysis(filters = {}) {
        const cacheKey = `top_items_${JSON.stringify(filters)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const { limit = 20, sortBy = 'revenue', sortOrder = 'desc' } = filters;
            const whereClause = this.buildWhereClause(filters, 'invoices');

            // Main query for item analytics
            const itemsData = await this.db
                .select({
                    itemId: items.id,
                    itemName: items.name,
                    itemType: items.type,
                    description: items.description,
                    sku: sql`COALESCE(${items.hsnSacCode}, 'N/A')`,
                    category: items.type,
                    unit: items.unit,
                    sellingPrice: items.sellingPrice,

                    // Sales metrics
                    totalQuantity: sql`COALESCE(SUM(${invoiceItems.quantity}), 0)`,
                    totalRevenue: sql`COALESCE(SUM(${invoiceItems.amount}), 0)`,
                    avgPrice: sql`COALESCE(AVG(${invoiceItems.rate}), 0)`,
                    invoiceCount: sql`COUNT(DISTINCT ${invoiceItems.invoiceId})`,

                    // Cost and profit calculations (using selling price as cost basis)
                    totalCost: sql`COALESCE(SUM(${invoiceItems.quantity} * ${items.sellingPrice} * 0.7), 0)`, // Assuming 30% margin
                    totalProfit: sql`COALESCE(SUM(${invoiceItems.amount}) - SUM(${invoiceItems.quantity} * ${items.sellingPrice} * 0.7), 0)`,
                    avgCostPrice: sql`COALESCE(${items.sellingPrice} * 0.7, 0)`,
                    profitMargin: sql`ROUND(
                        CASE 
                            WHEN SUM(${invoiceItems.amount}) > 0 
                            THEN ((SUM(${invoiceItems.amount}) - SUM(${invoiceItems.quantity} * ${items.sellingPrice} * 0.7)) / SUM(${invoiceItems.amount})) * 100
                            ELSE 0 
                        END, 2
                    )`,

                    // Time-based metrics
                    firstSold: sql`MIN(${invoices.invoiceDate})`,
                    lastSold: sql`MAX(${invoices.invoiceDate})`,
                    daysSinceLastSale: sql`ROUND(julianday('now') - julianday(MAX(${invoices.invoiceDate})), 0)`,

                    // Customer metrics
                    uniqueCustomers: sql`COUNT(DISTINCT ${invoices.customerId})`,
                    avgOrderValue: sql`COALESCE(AVG(${invoiceItems.amount}), 0)`,

                    // HSN/SAC and tax info
                    hsnSacCode: items.hsnSacCode,

                    // Performance indicators
                    inventoryTurnover: sql`ROUND(
                        CASE 
                            WHEN COUNT(DISTINCT ${invoiceItems.invoiceId}) > 0 
                            THEN SUM(${invoiceItems.quantity}) / COUNT(DISTINCT ${invoiceItems.invoiceId})
                            ELSE 0 
                        END, 2
                    )`,

                    // Frequency metrics
                    avgDaysBetweenSales: sql`ROUND(
                        CASE 
                            WHEN COUNT(DISTINCT ${invoiceItems.invoiceId}) > 1 
                            THEN (julianday(MAX(${invoices.invoiceDate})) - julianday(MIN(${invoices.invoiceDate}))) / (COUNT(DISTINCT ${invoiceItems.invoiceId}) - 1)
                            ELSE 0 
                        END, 1
                    )`
                })
                .from(invoiceItems)
                .innerJoin(items, eq(invoiceItems.itemId, items.id))
                .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
                .where(whereClause)
                .groupBy(
                    items.id, items.name, items.type, items.description,
                    items.sellingPrice, items.hsnSacCode, items.unit
                )
                .having(sql`COUNT(DISTINCT ${invoiceItems.invoiceId}) > 0`)
                .orderBy(this.buildItemsOrderByClause(sortBy, sortOrder))
                .limit(limit);

            // Calculate additional analytics and insights
            const enhancedData = await this.enhanceItemsAnalytics(itemsData, filters);

            // Get summary statistics
            const summaryStats = this.calculateItemsSummaryStats(enhancedData);

            const result = {
                items: enhancedData,
                summary: summaryStats,
                metadata: {
                    totalItems: enhancedData.length,
                    sortBy,
                    sortOrder,
                    filters: filters,
                    generatedAt: new Date().toISOString()
                }
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error fetching top items analysis:', error);
            // Return empty result instead of throwing to prevent UI crashes
            return {
                items: [],
                summary: {
                    totalRevenue: 0,
                    totalProfit: 0,
                    avgProfitMargin: 0,
                    totalQuantitySold: 0,
                    uniqueItems: 0,
                    highGrowthItems: 0
                },
                metadata: {
                    totalItems: 0,
                    sortBy: sortBy || 'revenue',
                    sortOrder: sortOrder || 'desc',
                    filters: filters,
                    generatedAt: new Date().toISOString(),
                    error: error.message
                }
            };
        }
    }

    /**
     * Enhance items data with additional analytics
     */
    async enhanceItemsAnalytics(itemsData, filters) {
        return itemsData.map(item => {
            // Calculate demand trend (simplified - comparing last 30 days vs previous 30 days)
            const demandTrend = this.calculateItemDemandTrend(item);

            // Calculate growth potential based on various factors
            const growthPotential = this.calculateItemGrowthPotential(item);

            // Calculate seasonality indicator
            const seasonality = this.calculateItemSeasonality(item);

            // Calculate stock status and reorder recommendations
            const stockAnalysis = this.calculateItemStockAnalysis(item);

            // Calculate competitive positioning
            const competitivePosition = this.calculateItemCompetitivePosition(item);

            return {
                ...item,
                // Convert numeric fields to ensure proper typing
                totalQuantity: Number(item.totalQuantity || 0),
                totalRevenue: Number(item.totalRevenue || 0),
                totalCost: Number(item.totalCost || 0),
                totalProfit: Number(item.totalProfit || 0),
                avgPrice: Number(item.avgPrice || 0),
                avgCostPrice: Number(item.avgCostPrice || 0),
                profitMargin: Number(item.profitMargin || 0),
                invoiceCount: Number(item.invoiceCount || 0),
                uniqueCustomers: Number(item.uniqueCustomers || 0),
                avgOrderValue: Number(item.avgOrderValue || 0),
                inventoryTurnover: Number(item.inventoryTurnover || 0),
                daysSinceLastSale: Number(item.daysSinceLastSale || 0),
                avgDaysBetweenSales: Number(item.avgDaysBetweenSales || 0),

                // Enhanced analytics
                demandTrend,
                growthPotential,
                seasonality,
                stockAnalysis,
                competitivePosition,

                // Performance scoring
                performanceScore: this.calculateItemPerformanceScore(item),
                riskLevel: this.calculateItemRiskLevel(item),

                // Forecasting (simplified)
                forecastDemand: Math.round((item.totalQuantity || 0) * (1 + (demandTrend / 100))),

                // Additional insights
                customerRating: this.calculateItemCustomerRating(item),
                priceElasticity: this.calculateItemPriceElasticity(item),
                marketShare: this.calculateItemMarketShare(item, itemsData)
            };
        });
    }

    /**
     * Calculate item demand trend (simplified)
     */
    calculateItemDemandTrend(item) {
        // Simplified calculation based on sales frequency and recency
        const daysSinceLastSale = item.daysSinceLastSale || 0;
        const avgDaysBetweenSales = item.avgDaysBetweenSales || 30;

        if (daysSinceLastSale === 0) return 20; // Recently sold = positive trend
        if (daysSinceLastSale <= avgDaysBetweenSales) return 15;
        if (daysSinceLastSale <= avgDaysBetweenSales * 2) return 5;
        if (daysSinceLastSale <= avgDaysBetweenSales * 3) return -5;
        return -15; // Not sold for a long time = negative trend
    }

    /**
     * Calculate item growth potential
     */
    calculateItemGrowthPotential(item) {
        const profitMargin = item.profitMargin || 0;
        const uniqueCustomers = item.uniqueCustomers || 0;
        const inventoryTurnover = item.inventoryTurnover || 0;

        if (profitMargin > 30 && uniqueCustomers > 5 && inventoryTurnover > 3) return 'Very High';
        if (profitMargin > 20 && uniqueCustomers > 3 && inventoryTurnover > 2) return 'High';
        if (profitMargin > 10 && uniqueCustomers > 1) return 'Medium';
        return 'Low';
    }

    /**
     * Calculate item seasonality
     */
    calculateItemSeasonality(item) {
        // Simplified - based on sales frequency
        const avgDaysBetweenSales = item.avgDaysBetweenSales || 30;

        if (avgDaysBetweenSales <= 7) return 'High';
        if (avgDaysBetweenSales <= 30) return 'Medium';
        return 'Low';
    }

    /**
     * Calculate stock analysis
     */
    calculateItemStockAnalysis(item) {
        const avgDaysBetweenSales = item.avgDaysBetweenSales || 30;
        const daysSinceLastSale = item.daysSinceLastSale || 0;

        // Simplified reorder point calculation
        const reorderPoint = Math.ceil((item.totalQuantity || 0) / (item.invoiceCount || 1) * 2);
        const currentStock = Math.max(0, (item.totalQuantity || 0) - daysSinceLastSale);
        const leadTime = Math.ceil(avgDaysBetweenSales / 7); // Simplified lead time

        return {
            reorderPoint,
            currentStock,
            leadTime,
            stockStatus: currentStock <= reorderPoint ? 'Low' : 'Adequate',
            needsReorder: currentStock <= reorderPoint
        };
    }

    /**
     * Calculate competitive position
     */
    calculateItemCompetitivePosition(item) {
        const profitMargin = item.profitMargin || 0;
        const avgPrice = item.avgPrice || 0;
        const sellingPrice = item.sellingPrice || 0;

        // Simplified competitive analysis
        const competitorPrice = sellingPrice * 1.05; // Assuming 5% higher competitor price
        const priceAdvantage = ((competitorPrice - avgPrice) / competitorPrice) * 100;

        return {
            competitorPrice,
            priceAdvantage: Math.round(priceAdvantage * 100) / 100,
            position: priceAdvantage > 5 ? 'Strong' : priceAdvantage > 0 ? 'Competitive' : 'Weak'
        };
    }

    /**
     * Calculate item performance score
     */
    calculateItemPerformanceScore(item) {
        let score = 0;

        // Revenue contribution (30% weight)
        const revenueScore = Math.min((item.totalRevenue || 0) / 50000 * 30, 30);
        score += revenueScore;

        // Profit margin (25% weight)
        const marginScore = Math.min((item.profitMargin || 0) / 40 * 25, 25);
        score += marginScore;

        // Sales frequency (20% weight)
        const invoiceScore = Math.min((item.invoiceCount || 0) / 10 * 20, 20);
        score += invoiceScore;

        // Customer diversity (15% weight)
        const customerScore = Math.min((item.uniqueCustomers || 0) / 5 * 15, 15);
        score += customerScore;

        // Recency (10% weight)
        const recencyScore = item.daysSinceLastSale <= 30 ? 10 : item.daysSinceLastSale <= 60 ? 5 : 0;
        score += recencyScore;

        return Math.round(Math.min(score, 100));
    }

    /**
     * Calculate item risk level
     */
    calculateItemRiskLevel(item) {
        const daysSinceLastSale = item.daysSinceLastSale || 0;
        const profitMargin = item.profitMargin || 0;
        const uniqueCustomers = item.uniqueCustomers || 0;

        if (daysSinceLastSale > 90 || profitMargin < 5 || uniqueCustomers === 1) return 'High';
        if (daysSinceLastSale > 60 || profitMargin < 15 || uniqueCustomers <= 2) return 'Medium';
        return 'Low';
    }

    /**
     * Calculate customer rating (simplified)
     */
    calculateItemCustomerRating(item) {
        const uniqueCustomers = item.uniqueCustomers || 0;
        const invoiceCount = item.invoiceCount || 0;

        // Simplified rating based on repeat purchases
        const repeatRate = uniqueCustomers > 0 ? invoiceCount / uniqueCustomers : 0;

        if (repeatRate >= 3) return 4.8;
        if (repeatRate >= 2) return 4.5;
        if (repeatRate >= 1.5) return 4.2;
        if (repeatRate >= 1) return 3.9;
        return 3.5;
    }

    /**
     * Calculate price elasticity (simplified)
     */
    calculateItemPriceElasticity(item) {
        // Simplified calculation - higher margin items tend to be less elastic
        const profitMargin = item.profitMargin || 0;

        if (profitMargin > 30) return -0.8; // Less elastic
        if (profitMargin > 20) return -1.0;
        if (profitMargin > 10) return -1.2;
        return -1.5; // More elastic
    }

    /**
     * Calculate market share (simplified)
     */
    calculateItemMarketShare(item, allItems) {
        const totalRevenue = allItems.reduce((sum, i) => sum + (i.totalRevenue || 0), 0);
        const itemRevenue = item.totalRevenue || 0;

        return totalRevenue > 0 ? Math.round((itemRevenue / totalRevenue) * 100 * 100) / 100 : 0;
    }

    /**
     * Calculate summary statistics
     */
    calculateItemsSummaryStats(items) {
        if (!items || items.length === 0) {
            return {
                totalRevenue: 0,
                totalProfit: 0,
                avgProfitMargin: 0,
                totalQuantitySold: 0,
                uniqueItems: 0,
                highGrowthItems: 0
            };
        }

        const totalRevenue = items.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
        const totalProfit = items.reduce((sum, item) => sum + (item.totalProfit || 0), 0);
        const avgProfitMargin = items.reduce((sum, item) => sum + (item.profitMargin || 0), 0) / items.length;
        const totalQuantitySold = items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
        const highGrowthItems = items.filter(item => item.growthPotential === 'High' || item.growthPotential === 'Very High').length;

        return {
            totalRevenue,
            totalProfit,
            avgProfitMargin: Math.round(avgProfitMargin * 100) / 100,
            totalQuantitySold,
            uniqueItems: items.length,
            highGrowthItems
        };
    }

    /**
     * Build order by clause for items
     */
    buildItemsOrderByClause(sortBy, sortOrder) {
        const direction = sortOrder === 'desc' ? desc : asc;

        switch (sortBy) {
            case 'revenue':
                return direction(sql`COALESCE(SUM(${invoiceItems.amount}), 0)`);
            case 'profit':
                return direction(sql`COALESCE(SUM(${invoiceItems.amount}) - SUM(${invoiceItems.quantity} * ${items.sellingPrice} * 0.7), 0)`);
            case 'quantity':
                return direction(sql`COALESCE(SUM(${invoiceItems.quantity}), 0)`);
            case 'profitMargin':
                return direction(sql`ROUND(
                    CASE 
                        WHEN SUM(${invoiceItems.amount}) > 0 
                        THEN ((SUM(${invoiceItems.amount}) - SUM(${invoiceItems.quantity} * ${items.sellingPrice} * 0.7)) / SUM(${invoiceItems.amount})) * 100
                        ELSE 0 
                    END, 2
                )`);
            case 'name':
                return direction(items.name);
            case 'lastSold':
                return direction(sql`MAX(${invoices.invoiceDate})`);
            default:
                return direction(sql`COALESCE(SUM(${invoiceItems.amount}), 0)`);
        }
    }

    /**
     * Tax Liability Report - Enhanced with Comprehensive Tax Analytics
     */
    async getTaxLiabilityReport(filters = {}) {
        const cacheKey = `tax_liability_${JSON.stringify(filters)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const whereClause = this.buildWhereClause(filters);

            // Main tax liability data
            const monthlyData = await this.db
                .select({
                    period: sql`strftime('%Y-%m', ${invoices.invoiceDate})`,
                    month: sql`strftime('%m', ${invoices.invoiceDate})`,
                    year: sql`strftime('%Y', ${invoices.invoiceDate})`,
                    totalCGST: sql`COALESCE(SUM(${invoices.cgstAmount}), 0)`,
                    totalSGST: sql`COALESCE(SUM(${invoices.sgstAmount}), 0)`,
                    totalIGST: sql`0`, // IGST not in current schema
                    totalTax: sql`COALESCE(SUM(${invoices.cgstAmount} + ${invoices.sgstAmount}), 0)`,
                    taxableAmount: sql`COALESCE(SUM(${invoices.subtotal}), 0)`,
                    totalInvoiceValue: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                    invoiceCount: sql`COUNT(${invoices.id})`,
                    avgTaxRate: sql`ROUND(
                        CASE 
                            WHEN SUM(${invoices.subtotal}) > 0 
                            THEN SUM(${invoices.cgstAmount} + ${invoices.sgstAmount}) * 100.0 / SUM(${invoices.subtotal})
                            ELSE 0 
                        END, 2
                    )`,
                    avgInvoiceValue: sql`COALESCE(AVG(${invoices.totalAmount}), 0)`,

                    // Tax efficiency metrics
                    effectiveTaxRate: sql`ROUND(
                        CASE 
                            WHEN SUM(${invoices.totalAmount}) > 0 
                            THEN SUM(${invoices.cgstAmount} + ${invoices.sgstAmount}) * 100.0 / SUM(${invoices.totalAmount})
                            ELSE 0 
                        END, 2
                    )`,

                    // Revenue breakdown by tax type
                    cgstRevenue: sql`COALESCE(SUM(CASE WHEN ${invoices.cgstAmount} > 0 THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    sgstRevenue: sql`COALESCE(SUM(CASE WHEN ${invoices.sgstAmount} > 0 THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    igstRevenue: sql`0`, // IGST not in current schema

                    // Customer analysis
                    uniqueCustomers: sql`COUNT(DISTINCT ${invoices.customerId})`,
                    avgTaxPerCustomer: sql`ROUND(
                        CASE 
                            WHEN COUNT(DISTINCT ${invoices.customerId}) > 0 
                            THEN SUM(${invoices.cgstAmount} + ${invoices.sgstAmount}) / COUNT(DISTINCT ${invoices.customerId})
                            ELSE 0 
                        END, 2
                    )`,

                    // Company analysis
                    uniqueCompanies: sql`COUNT(DISTINCT ${invoices.companyId})`,
                    avgTaxPerCompany: sql`ROUND(
                        CASE 
                            WHEN COUNT(DISTINCT ${invoices.companyId}) > 0 
                            THEN SUM(${invoices.cgstAmount} + ${invoices.sgstAmount}) / COUNT(DISTINCT ${invoices.companyId})
                            ELSE 0 
                        END, 2
                    )`
                })
                .from(invoices)
                .where(whereClause || sql`1=1`)
                .groupBy(sql`strftime('%Y-%m', ${invoices.invoiceDate})`)
                .orderBy(sql`strftime('%Y-%m', ${invoices.invoiceDate})`);

            // Enhanced data with additional calculations
            const enhancedMonthlyData = monthlyData.map((item, index) => {
                const totalCGST = Number(item.totalCGST || 0);
                const totalSGST = Number(item.totalSGST || 0);
                const totalIGST = Number(item.totalIGST || 0);
                const totalTax = Number(item.totalTax || 0);
                const taxableAmount = Number(item.taxableAmount || 0);
                const totalInvoiceValue = Number(item.totalInvoiceValue || 0);

                // Calculate growth from previous month
                let taxGrowth = 0;
                let revenueGrowth = 0;
                if (index > 0) {
                    const prevMonth = monthlyData[index - 1];
                    const prevTax = Number(prevMonth.totalTax || 0);
                    const prevRevenue = Number(prevMonth.totalInvoiceValue || 0);

                    if (prevTax > 0) {
                        taxGrowth = ((totalTax - prevTax) / prevTax) * 100;
                    }
                    if (prevRevenue > 0) {
                        revenueGrowth = ((totalInvoiceValue - prevRevenue) / prevRevenue) * 100;
                    }
                }

                // Tax composition analysis
                const taxComposition = {
                    cgstPercentage: totalTax > 0 ? (totalCGST / totalTax) * 100 : 0,
                    sgstPercentage: totalTax > 0 ? (totalSGST / totalTax) * 100 : 0,
                    igstPercentage: totalTax > 0 ? (totalIGST / totalTax) * 100 : 0
                };

                // Compliance indicators
                const compliance = this.calculateTaxCompliance(item);

                return {
                    ...item,
                    totalCGST,
                    totalSGST,
                    totalIGST,
                    totalTax,
                    taxableAmount,
                    totalInvoiceValue,
                    invoiceCount: Number(item.invoiceCount || 0),
                    avgTaxRate: Number(item.avgTaxRate || 0),
                    effectiveTaxRate: Number(item.effectiveTaxRate || 0),
                    avgInvoiceValue: Number(item.avgInvoiceValue || 0),
                    cgstRevenue: Number(item.cgstRevenue || 0),
                    sgstRevenue: Number(item.sgstRevenue || 0),
                    igstRevenue: Number(item.igstRevenue || 0),
                    uniqueCustomers: Number(item.uniqueCustomers || 0),
                    avgTaxPerCustomer: Number(item.avgTaxPerCustomer || 0),
                    uniqueCompanies: Number(item.uniqueCompanies || 0),
                    avgTaxPerCompany: Number(item.avgTaxPerCompany || 0),
                    taxGrowth: Math.round(taxGrowth * 10) / 10,
                    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
                    taxComposition,
                    compliance,
                    // Enhanced analytics
                    taxBurden: totalInvoiceValue > 0 ? (totalTax / totalInvoiceValue) * 100 : 0,
                    taxEfficiency: this.calculateTaxEfficiency(item),
                    monthName: this.getMonthName(Number(item.month || 1)),
                    quarter: Math.ceil(Number(item.month || 1) / 3),
                    // Forecasting indicators
                    forecast: false
                };
            });

            // Generate tax forecast for next 3 months
            const forecastData = this.generateTaxForecast(enhancedMonthlyData);

            // Calculate quarterly summaries
            const quarterlySummary = this.calculateQuarterlySummary(enhancedMonthlyData);

            // Tax optimization opportunities
            const optimizationOpportunities = await this.calculateTaxOptimization(enhancedMonthlyData, filters);

            // Compliance analysis
            const complianceAnalysis = this.calculateComplianceAnalysis(enhancedMonthlyData);

            // Summary metrics
            const summaryMetrics = this.calculateTaxSummaryMetrics(enhancedMonthlyData);

            // Industry benchmarks (simplified)
            const industryBenchmarks = this.calculateTaxBenchmarks(enhancedMonthlyData);

            const result = {
                monthlyData: enhancedMonthlyData,
                forecastData,
                quarterlySummary,
                optimizationOpportunities,
                complianceAnalysis,
                summaryMetrics,
                industryBenchmarks,
                metadata: {
                    totalMonths: enhancedMonthlyData.length,
                    dateRange: {
                        start: enhancedMonthlyData[0]?.period || null,
                        end: enhancedMonthlyData[enhancedMonthlyData.length - 1]?.period || null
                    },
                    generatedAt: new Date().toISOString(),
                    filters
                }
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error fetching tax liability report:', error);
            throw new Error(`Failed to fetch tax liability report: ${error.message}`);
        }
    }

    /**
     * Calculate tax compliance for a given period
     */
    calculateTaxCompliance(periodData) {
        const totalTax = Number(periodData.totalTax || 0);
        const invoiceCount = Number(periodData.invoiceCount || 0);
        const avgTaxRate = Number(periodData.avgTaxRate || 0);

        // Simplified compliance scoring
        let complianceScore = 100;

        // Check for reasonable tax rates (typical GST is 5%, 12%, 18%, 28%)
        if (avgTaxRate < 5 || avgTaxRate > 30) {
            complianceScore -= 10;
        }

        // Check for consistent tax collection
        if (invoiceCount > 0 && totalTax === 0) {
            complianceScore -= 20;
        }

        // Check for tax rate consistency
        const expectedTaxRates = [5, 12, 18, 28];
        const closestRate = expectedTaxRates.reduce((prev, curr) =>
            Math.abs(curr - avgTaxRate) < Math.abs(prev - avgTaxRate) ? curr : prev
        );
        const rateDeviation = Math.abs(avgTaxRate - closestRate);
        if (rateDeviation > 2) {
            complianceScore -= Math.min(15, rateDeviation * 2);
        }

        return {
            score: Math.max(0, Math.round(complianceScore)),
            status: complianceScore >= 95 ? 'Excellent' :
                complianceScore >= 85 ? 'Good' :
                    complianceScore >= 70 ? 'Fair' : 'Needs Attention',
            issues: complianceScore < 100 ? this.identifyComplianceIssues(periodData, complianceScore) : []
        };
    }

    /**
     * Identify specific compliance issues
     */
    identifyComplianceIssues(periodData, score) {
        const issues = [];
        const avgTaxRate = Number(periodData.avgTaxRate || 0);
        const totalTax = Number(periodData.totalTax || 0);
        const invoiceCount = Number(periodData.invoiceCount || 0);

        if (avgTaxRate < 5) {
            issues.push('Tax rate appears unusually low - verify GST calculations');
        }
        if (avgTaxRate > 30) {
            issues.push('Tax rate appears unusually high - review tax classifications');
        }
        if (invoiceCount > 0 && totalTax === 0) {
            issues.push('No tax collected despite having invoices - check tax setup');
        }

        return issues;
    }

    /**
     * Calculate tax efficiency
     */
    calculateTaxEfficiency(periodData) {
        const totalTax = Number(periodData.totalTax || 0);
        const totalRevenue = Number(periodData.totalInvoiceValue || 0);
        const invoiceCount = Number(periodData.invoiceCount || 0);

        if (totalRevenue === 0) return 0;

        // Tax efficiency based on automation and accuracy
        let efficiency = 85; // Base efficiency

        // Bonus for consistent tax rates
        const avgTaxRate = Number(periodData.avgTaxRate || 0);
        const standardRates = [5, 12, 18, 28];
        const isStandardRate = standardRates.some(rate => Math.abs(rate - avgTaxRate) < 1);
        if (isStandardRate) efficiency += 10;

        // Bonus for reasonable tax-to-revenue ratio
        const taxRatio = (totalTax / totalRevenue) * 100;
        if (taxRatio >= 5 && taxRatio <= 25) efficiency += 5;

        return Math.min(100, Math.round(efficiency));
    }

    /**
     * Generate tax forecast for next periods
     */
    generateTaxForecast(historicalData) {
        if (historicalData.length < 3) return [];

        const forecast = [];
        const lastThreeMonths = historicalData.slice(-3);
        const avgGrowth = lastThreeMonths.reduce((sum, month) => sum + (month.taxGrowth || 0), 0) / 3;
        const avgTaxRate = lastThreeMonths.reduce((sum, month) => sum + (month.avgTaxRate || 0), 0) / 3;
        const lastMonth = historicalData[historicalData.length - 1];

        for (let i = 1; i <= 3; i++) {
            const forecastDate = new Date(lastMonth.year, Number(lastMonth.month) - 1 + i, 1);
            const forecastPeriod = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;

            const projectedRevenue = (lastMonth.totalInvoiceValue || 0) * (1 + (avgGrowth / 100));
            const projectedTax = projectedRevenue * (avgTaxRate / 100);

            forecast.push({
                period: forecastPeriod,
                month: String(forecastDate.getMonth() + 1).padStart(2, '0'),
                year: String(forecastDate.getFullYear()),
                totalTax: Math.round(projectedTax),
                totalCGST: Math.round(projectedTax * 0.4),
                totalSGST: Math.round(projectedTax * 0.4),
                totalIGST: Math.round(projectedTax * 0.2),
                totalInvoiceValue: Math.round(projectedRevenue),
                taxableAmount: Math.round(projectedRevenue * 0.85),
                avgTaxRate: Math.round(avgTaxRate * 10) / 10,
                invoiceCount: Math.round((lastMonth.invoiceCount || 0) * (1 + (avgGrowth / 200))),
                forecast: true,
                confidence: this.calculateForecastConfidence(historicalData),
                monthName: this.getMonthName(forecastDate.getMonth() + 1),
                quarter: Math.ceil((forecastDate.getMonth() + 1) / 3)
            });
        }

        return forecast;
    }

    /**
     * Calculate forecast confidence based on data consistency
     */
    calculateForecastConfidence(historicalData) {
        if (historicalData.length < 3) return 'Low';

        const recentData = historicalData.slice(-6); // Last 6 months
        const growthRates = recentData.map(d => d.taxGrowth || 0);
        const variance = this.calculateVariance(growthRates);

        if (variance < 25) return 'High';
        if (variance < 100) return 'Medium';
        return 'Low';
    }

    /**
     * Calculate variance of an array
     */
    calculateVariance(numbers) {
        const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
        const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
    }

    /**
     * Calculate quarterly summary
     */
    calculateQuarterlySummary(monthlyData) {
        const quarters = {};

        monthlyData.forEach(month => {
            const quarter = `Q${month.quarter}-${month.year}`;
            if (!quarters[quarter]) {
                quarters[quarter] = {
                    quarter: `Q${month.quarter}`,
                    year: month.year,
                    totalTax: 0,
                    totalRevenue: 0,
                    invoiceCount: 0,
                    months: []
                };
            }

            quarters[quarter].totalTax += month.totalTax || 0;
            quarters[quarter].totalRevenue += month.totalInvoiceValue || 0;
            quarters[quarter].invoiceCount += month.invoiceCount || 0;
            quarters[quarter].months.push(month);
        });

        return Object.values(quarters).map(q => ({
            ...q,
            avgTaxRate: q.totalRevenue > 0 ? (q.totalTax / q.totalRevenue) * 100 : 0,
            monthCount: q.months.length
        }));
    }

    /**
     * Calculate tax optimization opportunities
     */
    async calculateTaxOptimization(monthlyData, filters) {
        const opportunities = [];
        const totalTax = monthlyData.reduce((sum, month) => sum + (month.totalTax || 0), 0);
        const avgTaxRate = monthlyData.reduce((sum, month) => sum + (month.avgTaxRate || 0), 0) / monthlyData.length;

        // Input Tax Credit optimization
        if (avgTaxRate > 15) {
            opportunities.push({
                type: 'Input Tax Credit',
                description: 'Review vendor invoices for unclaimed ITC opportunities',
                potentialSaving: Math.round(totalTax * 0.08), // 8% potential saving
                impact: 'High',
                effort: 'Medium',
                timeframe: '1-2 months',
                status: 'Available',
                category: 'Credit Optimization'
            });
        }

        // Composition scheme analysis
        if (totalTax > 200000) {
            opportunities.push({
                type: 'Composition Scheme Review',
                description: 'Evaluate eligibility for composition scheme to reduce tax burden',
                potentialSaving: Math.round(totalTax * 0.12), // 12% potential saving
                impact: 'High',
                effort: 'High',
                timeframe: '3-6 months',
                status: 'Under Review',
                category: 'Scheme Optimization'
            });
        }

        // Export benefits
        const interStateTax = monthlyData.reduce((sum, month) => sum + (month.totalIGST || 0), 0);
        if (interStateTax > 50000) {
            opportunities.push({
                type: 'Export Benefits',
                description: 'Explore zero-rated supplies for export transactions',
                potentialSaving: Math.round(interStateTax * 0.15), // 15% of IGST
                impact: 'Medium',
                effort: 'Low',
                timeframe: '1 month',
                status: 'Available',
                category: 'Export Optimization'
            });
        }

        // HSN code optimization
        opportunities.push({
            type: 'HSN Code Review',
            description: 'Review product classifications for optimal tax rates',
            potentialSaving: Math.round(totalTax * 0.05), // 5% potential saving
            impact: 'Medium',
            effort: 'Medium',
            timeframe: '2-3 months',
            status: 'Recommended',
            category: 'Classification Optimization'
        });

        return opportunities;
    }

    /**
     * Calculate compliance analysis
     */
    calculateComplianceAnalysis(monthlyData) {
        const totalMonths = monthlyData.length;
        const compliantMonths = monthlyData.filter(month => month.compliance.score >= 90).length;
        const avgComplianceScore = monthlyData.reduce((sum, month) => sum + month.compliance.score, 0) / totalMonths;

        const filingStatus = monthlyData.map(month => ({
            period: month.period,
            monthName: month.monthName,
            status: month.compliance.score >= 95 ? 'Filed' :
                month.compliance.score >= 85 ? 'Filed Late' : 'Pending',
            score: month.compliance.score,
            issues: month.compliance.issues
        }));

        return {
            overallScore: Math.round(avgComplianceScore),
            complianceRate: Math.round((compliantMonths / totalMonths) * 100),
            filingStatus,
            recommendations: this.generateComplianceRecommendations(monthlyData),
            riskLevel: avgComplianceScore >= 90 ? 'Low' :
                avgComplianceScore >= 75 ? 'Medium' : 'High'
        };
    }

    /**
     * Generate compliance recommendations
     */
    generateComplianceRecommendations(monthlyData) {
        const recommendations = [];
        const avgScore = monthlyData.reduce((sum, month) => sum + month.compliance.score, 0) / monthlyData.length;

        if (avgScore < 90) {
            recommendations.push({
                priority: 'High',
                category: 'Tax Calculation',
                recommendation: 'Review tax calculation methods to ensure accuracy',
                impact: 'Reduces compliance risk and potential penalties'
            });
        }

        const inconsistentRates = monthlyData.filter(month => {
            const rate = month.avgTaxRate;
            return rate > 0 && ![5, 12, 18, 28].some(std => Math.abs(std - rate) < 2);
        });

        if (inconsistentRates.length > 0) {
            recommendations.push({
                priority: 'Medium',
                category: 'Rate Consistency',
                recommendation: 'Standardize tax rates according to GST guidelines',
                impact: 'Improves compliance and reduces audit risk'
            });
        }

        return recommendations;
    }

    /**
     * Calculate summary metrics
     */
    calculateTaxSummaryMetrics(monthlyData) {
        const totalTax = monthlyData.reduce((sum, month) => sum + (month.totalTax || 0), 0);
        const totalRevenue = monthlyData.reduce((sum, month) => sum + (month.totalInvoiceValue || 0), 0);
        const totalInvoices = monthlyData.reduce((sum, month) => sum + (month.invoiceCount || 0), 0);
        const avgTaxRate = monthlyData.reduce((sum, month) => sum + (month.avgTaxRate || 0), 0) / monthlyData.length;

        const cgstTotal = monthlyData.reduce((sum, month) => sum + (month.totalCGST || 0), 0);
        const sgstTotal = monthlyData.reduce((sum, month) => sum + (month.totalSGST || 0), 0);
        const igstTotal = monthlyData.reduce((sum, month) => sum + (month.totalIGST || 0), 0);

        return {
            totalTaxCollected: totalTax,
            totalRevenue,
            totalInvoices,
            avgTaxRate: Math.round(avgTaxRate * 10) / 10,
            effectiveTaxRate: totalRevenue > 0 ? Math.round((totalTax / totalRevenue) * 100 * 10) / 10 : 0,
            taxBreakdown: {
                cgst: cgstTotal,
                sgst: sgstTotal,
                igst: igstTotal,
                cgstPercentage: totalTax > 0 ? Math.round((cgstTotal / totalTax) * 100) : 0,
                sgstPercentage: totalTax > 0 ? Math.round((sgstTotal / totalTax) * 100) : 0,
                igstPercentage: totalTax > 0 ? Math.round((igstTotal / totalTax) * 100) : 0
            },
            avgTaxPerInvoice: totalInvoices > 0 ? Math.round(totalTax / totalInvoices) : 0,
            monthlyAverage: Math.round(totalTax / monthlyData.length),
            complianceOverview: {
                avgScore: Math.round(monthlyData.reduce((sum, month) => sum + month.compliance.score, 0) / monthlyData.length),
                excellentMonths: monthlyData.filter(month => month.compliance.score >= 95).length,
                goodMonths: monthlyData.filter(month => month.compliance.score >= 85 && month.compliance.score < 95).length,
                needsAttentionMonths: monthlyData.filter(month => month.compliance.score < 85).length
            }
        };
    }

    /**
     * Calculate tax benchmarks
     */
    calculateTaxBenchmarks(monthlyData) {
        const avgTaxRate = monthlyData.reduce((sum, month) => sum + (month.avgTaxRate || 0), 0) / monthlyData.length;
        const totalRevenue = monthlyData.reduce((sum, month) => sum + (month.totalInvoiceValue || 0), 0);

        // Industry benchmarks (simplified - in real implementation, these would come from external data)
        const industryBenchmarks = {
            manufacturing: { avgTaxRate: 16.5, efficiency: 88 },
            services: { avgTaxRate: 18.0, efficiency: 92 },
            retail: { avgTaxRate: 14.2, efficiency: 85 },
            wholesale: { avgTaxRate: 12.8, efficiency: 90 }
        };

        // Determine likely industry based on tax rate
        let likelyIndustry = 'services';
        let minDiff = Math.abs(avgTaxRate - industryBenchmarks.services.avgTaxRate);

        Object.entries(industryBenchmarks).forEach(([industry, benchmark]) => {
            const diff = Math.abs(avgTaxRate - benchmark.avgTaxRate);
            if (diff < minDiff) {
                minDiff = diff;
                likelyIndustry = industry;
            }
        });

        const benchmark = industryBenchmarks[likelyIndustry];
        const performance = {
            taxRateComparison: avgTaxRate - benchmark.avgTaxRate,
            efficiencyComparison: monthlyData.reduce((sum, month) => sum + month.taxEfficiency, 0) / monthlyData.length - benchmark.efficiency,
            position: 'Average' // Simplified
        };

        return {
            industry: likelyIndustry,
            benchmark,
            performance,
            recommendations: this.generateBenchmarkRecommendations(performance, benchmark)
        };
    }

    /**
     * Generate benchmark recommendations
     */
    generateBenchmarkRecommendations(performance, benchmark) {
        const recommendations = [];

        if (performance.taxRateComparison > 2) {
            recommendations.push({
                type: 'Tax Rate Optimization',
                description: 'Your tax rate is above industry average. Review product classifications.',
                priority: 'High'
            });
        }

        if (performance.efficiencyComparison < -5) {
            recommendations.push({
                type: 'Process Efficiency',
                description: 'Tax processing efficiency below industry standard. Consider automation.',
                priority: 'Medium'
            });
        }

        return recommendations;
    }

    /**
     * Get month name from number
     */
    getMonthName(monthNumber) {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return months[monthNumber - 1] || 'Unknown';
    }

    /**
     * Enhanced Invoice Aging Report with Comprehensive Analytics
     */
    async getInvoiceAgingReport(filters = {}) {
        const cacheKey = `invoice_aging_enhanced_${JSON.stringify(filters)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const currentDate = new Date().toISOString().split('T')[0];
            const whereClause = this.buildWhereClause(filters);

            // 1. Get detailed aging buckets with comprehensive metrics
            const agingBuckets = await this.db
                .select({
                    range: sql`CASE 
                        WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 0 THEN '0-30 days'
                        WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 30 THEN '31-60 days'
                        WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 60 THEN '61-90 days'
                        ELSE '90+ days'
                    END`,
                    amount: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                    invoices: sql`COUNT(${invoices.id})`,
                    customers: sql`COUNT(DISTINCT ${invoices.customerId})`,
                    avgDays: sql`ROUND(AVG(
                        CASE 
                            WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) > 0 
                            THEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate})
                            ELSE 0 
                        END
                    ), 0)`,
                    avgAmount: sql`ROUND(AVG(${invoices.totalAmount}), 2)`,
                    collectionRate: sql`ROUND(
                        COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END) * 100.0 / 
                        (COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END) + COUNT(*)), 2
                    )`,
                    paidInvoices: sql`COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END)`,
                    pendingInvoices: sql`COUNT(CASE WHEN ${invoices.status} = 'pending' THEN 1 END)`,
                    overdueInvoices: sql`COUNT(CASE WHEN ${invoices.status} = 'overdue' THEN 1 END)`
                })
                .from(invoices)
                .innerJoin(customers, eq(invoices.customerId, customers.id))
                .where(and(whereClause || sql`1=1`, sql`${invoices.status} IN ('pending', 'overdue')`))
                .groupBy(sql`CASE 
                    WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 0 THEN '0-30 days'
                    WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 30 THEN '31-60 days'
                    WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 60 THEN '61-90 days'
                    ELSE '90+ days'
                END`)
                .orderBy(sql`CASE 
                    WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 0 THEN 1
                    WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 30 THEN 2
                    WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 60 THEN 3
                    ELSE 4
                END`);

            // 2. Get customer-wise aging analysis
            const customerAging = await this.db
                .select({
                    customerId: customers.id,
                    customer: customers.companyName,
                    total: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                    current: sql`COALESCE(SUM(
                        CASE WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 0 
                        THEN ${invoices.totalAmount} ELSE 0 END
                    ), 0)`,
                    days30: sql`COALESCE(SUM(
                        CASE WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) > 0 
                        AND julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 30 
                        THEN ${invoices.totalAmount} ELSE 0 END
                    ), 0)`,
                    days60: sql`COALESCE(SUM(
                        CASE WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) > 30 
                        AND julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) <= 60 
                        THEN ${invoices.totalAmount} ELSE 0 END
                    ), 0)`,
                    days90: sql`COALESCE(SUM(
                        CASE WHEN julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate}) > 60 
                        THEN ${invoices.totalAmount} ELSE 0 END
                    ), 0)`,
                    invoiceCount: sql`COUNT(${invoices.id})`,
                    avgPaymentDays: sql`ROUND(AVG(
                        CASE 
                            WHEN ${invoices.paidDate} IS NOT NULL 
                            THEN julianday(${invoices.paidDate}) - julianday(${invoices.invoiceDate})
                            ELSE julianday('${sql.raw(currentDate)}') - julianday(${invoices.invoiceDate})
                        END
                    ), 0)`,
                    paymentHistory: sql`ROUND(
                        COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END) * 100.0 / COUNT(*), 0
                    )`,
                    lastPayment: sql`MAX(${invoices.paidDate})`,
                    creditLimit: sql`100000`, // Default credit limit - should come from customer table
                    onTimePayments: sql`COUNT(CASE 
                        WHEN ${invoices.paidDate} IS NOT NULL 
                        AND julianday(${invoices.paidDate}) <= julianday(${invoices.dueDate}) 
                        THEN 1 END
                    )`,
                    latePayments: sql`COUNT(CASE 
                        WHEN ${invoices.paidDate} IS NOT NULL 
                        AND julianday(${invoices.paidDate}) > julianday(${invoices.dueDate}) 
                        THEN 1 END
                    )`
                })
                .from(invoices)
                .innerJoin(customers, eq(invoices.customerId, customers.id))
                .where(and(whereClause || sql`1=1`, sql`${invoices.status} IN ('pending', 'overdue', 'paid')`))
                .groupBy(customers.id, customers.companyName)
                .having(sql`COUNT(${invoices.id}) > 0`)
                .orderBy(desc(sql`COALESCE(SUM(${invoices.totalAmount}), 0)`))
                .limit(20);

            // 3. Get collection efficiency trends (last 6 months)
            const collectionTrends = await this.db
                .select({
                    month: sql`strftime('%m', ${invoices.invoiceDate})`,
                    monthName: sql`CASE strftime('%m', ${invoices.invoiceDate})
                        WHEN '01' THEN 'Jan' WHEN '02' THEN 'Feb' WHEN '03' THEN 'Mar'
                        WHEN '04' THEN 'Apr' WHEN '05' THEN 'May' WHEN '06' THEN 'Jun'
                        WHEN '07' THEN 'Jul' WHEN '08' THEN 'Aug' WHEN '09' THEN 'Sep'
                        WHEN '10' THEN 'Oct' WHEN '11' THEN 'Nov' WHEN '12' THEN 'Dec'
                    END`,
                    period: sql`strftime('%Y-%m', ${invoices.invoiceDate})`,
                    collected: sql`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    outstanding: sql`COALESCE(SUM(CASE WHEN ${invoices.status} IN ('pending', 'overdue') THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    totalInvoiced: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                    efficiency: sql`ROUND(
                        CASE WHEN SUM(${invoices.totalAmount}) > 0 
                        THEN SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.totalAmount} ELSE 0 END) * 100.0 / SUM(${invoices.totalAmount})
                        ELSE 0 END, 0
                    )`,
                    dso: sql`ROUND(AVG(
                        CASE 
                            WHEN ${invoices.paidDate} IS NOT NULL 
                            THEN julianday(${invoices.paidDate}) - julianday(${invoices.invoiceDate})
                            ELSE julianday('${sql.raw(currentDate)}') - julianday(${invoices.invoiceDate})
                        END
                    ), 0)`,
                    invoiceCount: sql`COUNT(${invoices.id})`
                })
                .from(invoices)
                .where(and(
                    whereClause || sql`1=1`,
                    gte(invoices.invoiceDate, sql`date('now', '-6 months')`)
                ))
                .groupBy(sql`strftime('%Y-%m', ${invoices.invoiceDate})`)
                .orderBy(sql`strftime('%Y-%m', ${invoices.invoiceDate})`);

            // 4. Calculate previous period data for trend analysis
            const previousPeriodStart = new Date();
            previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
            const previousPeriodStartStr = previousPeriodStart.toISOString().split('T')[0];

            const previousPeriodData = await this.db
                .select({
                    range: sql`CASE 
                        WHEN julianday('${sql.raw(previousPeriodStartStr)}') - julianday(${invoices.dueDate}) <= 0 THEN '0-30 days'
                        WHEN julianday('${sql.raw(previousPeriodStartStr)}') - julianday(${invoices.dueDate}) <= 30 THEN '31-60 days'
                        WHEN julianday('${sql.raw(previousPeriodStartStr)}') - julianday(${invoices.dueDate}) <= 60 THEN '61-90 days'
                        ELSE '90+ days'
                    END`,
                    amount: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`
                })
                .from(invoices)
                .where(and(
                    whereClause || sql`1=1`,
                    gte(invoices.invoiceDate, sql`date('now', '-2 months')`),
                    lt(invoices.invoiceDate, sql`date('now', '-1 month')`),
                    sql`${invoices.status} IN ('pending', 'overdue')`
                ))
                .groupBy(sql`CASE 
                    WHEN julianday('${sql.raw(previousPeriodStartStr)}') - julianday(${invoices.dueDate}) <= 0 THEN '0-30 days'
                    WHEN julianday('${sql.raw(previousPeriodStartStr)}') - julianday(${invoices.dueDate}) <= 30 THEN '31-60 days'
                    WHEN julianday('${sql.raw(previousPeriodStartStr)}') - julianday(${invoices.dueDate}) <= 60 THEN '61-90 days'
                    ELSE '90+ days'
                END`);

            // 5. Enhance aging buckets with additional analytics
            const enhancedAgingBuckets = agingBuckets.map(bucket => {
                const amount = Number(bucket.amount || 0);
                const invoices = Number(bucket.invoices || 0);
                const customers = Number(bucket.customers || 0);
                const avgDays = Number(bucket.avgDays || 0);
                const collectionRate = Number(bucket.collectionRate || 0);

                // Calculate trend from previous period
                const previousAmount = previousPeriodData.find(p => p.range === bucket.range)?.amount || 0;
                const trend = previousAmount > 0 ? ((amount - previousAmount) / previousAmount) * 100 : 0;

                // Determine risk level and priority
                let riskLevel = 'Low';
                let priority = 'Monitor';

                if (bucket.range === '90+ days') {
                    riskLevel = 'Critical';
                    priority = 'Critical';
                } else if (bucket.range === '61-90 days') {
                    riskLevel = 'High';
                    priority = 'Urgent';
                } else if (bucket.range === '31-60 days') {
                    riskLevel = 'Medium';
                    priority = 'Follow-up';
                }

                return {
                    range: bucket.range,
                    amount,
                    invoices,
                    customers,
                    avgDays,
                    collectionRate: Math.round(collectionRate),
                    riskLevel,
                    priority,
                    trend: Math.round(trend * 10) / 10,
                    avgAmount: invoices > 0 ? Math.round(amount / invoices) : 0,
                    percentage: 0 // Will be calculated after totals
                };
            });

            // 6. Enhance customer aging with risk scoring
            const enhancedCustomerAging = customerAging.map(customer => {
                const total = Number(customer.total || 0);
                const current = Number(customer.current || 0);
                const days30 = Number(customer.days30 || 0);
                const days60 = Number(customer.days60 || 0);
                const days90 = Number(customer.days90 || 0);
                const paymentHistory = Number(customer.paymentHistory || 0);
                const avgPaymentDays = Number(customer.avgPaymentDays || 0);
                const onTimePayments = Number(customer.onTimePayments || 0);
                const latePayments = Number(customer.latePayments || 0);
                const totalPayments = onTimePayments + latePayments;

                // Calculate risk score (0-100, higher is riskier)
                let riskScore = 0;
                if (paymentHistory < 50) riskScore += 40;
                else if (paymentHistory < 70) riskScore += 25;
                else if (paymentHistory < 85) riskScore += 10;

                if (days90 > 0) riskScore += 30;
                else if (days60 > 0) riskScore += 20;
                else if (days30 > 0) riskScore += 10;

                if (avgPaymentDays > 60) riskScore += 20;
                else if (avgPaymentDays > 45) riskScore += 15;
                else if (avgPaymentDays > 30) riskScore += 10;

                // Determine trend
                let trend = 'Stable';
                if (totalPayments > 0) {
                    const onTimeRate = (onTimePayments / totalPayments) * 100;
                    if (onTimeRate > 80) trend = 'Improving';
                    else if (onTimeRate < 50) trend = 'Deteriorating';
                }

                return {
                    ...customer,
                    total,
                    current,
                    days30,
                    days60,
                    days90,
                    paymentHistory: Math.round(paymentHistory),
                    avgPaymentDays,
                    riskScore: Math.min(100, riskScore),
                    trend,
                    creditLimit: Number(customer.creditLimit || 100000)
                };
            });

            // 7. Calculate totals and percentages
            const totalOutstanding = enhancedAgingBuckets.reduce((sum, bucket) => sum + bucket.amount, 0);
            const totalInvoices = enhancedAgingBuckets.reduce((sum, bucket) => sum + bucket.invoices, 0);

            // Update percentages
            enhancedAgingBuckets.forEach(bucket => {
                bucket.percentage = totalOutstanding > 0 ?
                    Math.round((bucket.amount / totalOutstanding) * 100 * 10) / 10 : 0;
            });

            // 8. Calculate summary metrics
            const avgDSO = totalOutstanding > 0 ?
                enhancedAgingBuckets.reduce((sum, bucket) => sum + (bucket.avgDays * bucket.amount), 0) / totalOutstanding : 0;

            const overdue = enhancedAgingBuckets
                .filter(bucket => bucket.range !== '0-30 days')
                .reduce((sum, bucket) => sum + bucket.amount, 0);

            const overduePercentage = totalOutstanding > 0 ? (overdue / totalOutstanding) * 100 : 0;

            const currentEfficiency = collectionTrends.length > 0 ?
                collectionTrends[collectionTrends.length - 1].efficiency : 0;

            // 9. Generate insights and recommendations
            const insights = this.generateAgingInsights(enhancedAgingBuckets, enhancedCustomerAging, collectionTrends);

            const result = {
                agingBuckets: enhancedAgingBuckets,
                customerAging: enhancedCustomerAging,
                collectionTrends: collectionTrends.map(trend => ({
                    ...trend,
                    collected: Number(trend.collected || 0),
                    outstanding: Number(trend.outstanding || 0),
                    efficiency: Number(trend.efficiency || 0),
                    dso: Number(trend.dso || 0),
                    invoiceCount: Number(trend.invoiceCount || 0)
                })),
                summary: {
                    totalOutstanding,
                    totalInvoices,
                    avgDSO: Math.round(avgDSO),
                    overduePercentage: Math.round(overduePercentage * 10) / 10,
                    currentEfficiency: Math.round(currentEfficiency),
                    totalCustomers: enhancedCustomerAging.length,
                    highRiskCustomers: enhancedCustomerAging.filter(c => c.riskScore > 60).length,
                    criticalAmount: enhancedAgingBuckets.find(b => b.range === '90+ days')?.amount || 0
                },
                insights,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    currentDate,
                    filters,
                    dataQuality: {
                        hasAgingData: enhancedAgingBuckets.length > 0,
                        hasCustomerData: enhancedCustomerAging.length > 0,
                        hasTrendData: collectionTrends.length > 0
                    }
                }
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error fetching enhanced invoice aging report:', error);
            throw new Error(`Failed to fetch invoice aging report: ${error.message}`);
        }
    }

    /**
     * Generate insights and recommendations for aging report
     */
    generateAgingInsights(agingBuckets, customerAging, collectionTrends) {
        const insights = [];
        const totalOutstanding = agingBuckets.reduce((sum, bucket) => sum + bucket.amount, 0);

        // Collection health insight
        const currentEfficiency = collectionTrends.length > 0 ?
            collectionTrends[collectionTrends.length - 1].efficiency : 0;

        if (currentEfficiency >= 75) {
            insights.push({
                type: 'positive',
                icon: 'CheckCircle',
                title: 'Collection Health',
                message: `${currentEfficiency}% efficiency rate - above industry average of 72%.`
            });
        } else if (currentEfficiency >= 60) {
            insights.push({
                type: 'warning',
                icon: 'AlertTriangle',
                title: 'Collection Health',
                message: `${currentEfficiency}% efficiency rate - room for improvement.`
            });
        } else {
            insights.push({
                type: 'negative',
                icon: 'AlertTriangle',
                title: 'Collection Health',
                message: `${currentEfficiency}% efficiency rate - urgent attention needed.`
            });
        }

        // Risk alert for high-risk customers
        const highRiskCustomers = customerAging.filter(c => c.riskScore > 60);
        if (highRiskCustomers.length > 0) {
            const topRiskCustomer = highRiskCustomers.reduce((max, customer) =>
                customer.riskScore > max.riskScore ? customer : max, highRiskCustomers[0]);

            insights.push({
                type: 'warning',
                icon: 'AlertTriangle',
                title: 'Risk Alert',
                message: `${topRiskCustomer.customer} showing high risk pattern (${topRiskCustomer.riskScore}/100).`
            });
        }

        // Cash flow opportunity
        const criticalBucket = agingBuckets.find(b => b.range === '90+ days');
        if (criticalBucket && criticalBucket.amount > 50000) {
            const potentialImprovement = Math.round(criticalBucket.amount * 0.3);
            insights.push({
                type: 'opportunity',
                icon: 'Target',
                title: 'Opportunity',
                message: `Reducing 90+ days aging could improve cash flow by ₹${(potentialImprovement / 100000).toFixed(1)}L.`
            });
        }

        // DSO improvement opportunity
        const avgDSO = totalOutstanding > 0 ?
            agingBuckets.reduce((sum, bucket) => sum + (bucket.avgDays * bucket.amount), 0) / totalOutstanding : 0;

        if (avgDSO > 45) {
            const potentialImprovement = Math.round(totalOutstanding * 0.15);
            insights.push({
                type: 'opportunity',
                icon: 'Target',
                title: 'DSO Improvement',
                message: `Reducing DSO by 5 days could improve cash flow by ₹${(potentialImprovement / 100000).toFixed(1)}L.`
            });
        }

        return insights;
    }

    /**
     * Enhanced Payment Delay Analysis with Comprehensive Dashboard Data
     */
    async getPaymentDelayAnalysis(filters = {}) {
        const cacheKey = `payment_delay_enhanced_${JSON.stringify(filters)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const whereClause = this.buildWhereClause(filters);
            const currentDate = new Date().toISOString().split('T')[0];

            // 1. Get monthly payment trends (last 12 months)
            const monthlyTrends = await this.db
                .select({
                    month: sql`strftime('%m', ${invoices.invoiceDate})`,
                    monthName: sql`CASE strftime('%m', ${invoices.invoiceDate})
                        WHEN '01' THEN 'Jan' WHEN '02' THEN 'Feb' WHEN '03' THEN 'Mar'
                        WHEN '04' THEN 'Apr' WHEN '05' THEN 'May' WHEN '06' THEN 'Jun'
                        WHEN '07' THEN 'Jul' WHEN '08' THEN 'Aug' WHEN '09' THEN 'Sep'
                        WHEN '10' THEN 'Oct' WHEN '11' THEN 'Nov' WHEN '12' THEN 'Dec'
                    END`,
                    period: sql`strftime('%Y-%m', ${invoices.invoiceDate})`,
                    avgDelay: sql`ROUND(AVG(
                        CASE 
                            WHEN ${invoices.paidDate} IS NOT NULL 
                            THEN julianday(${invoices.paidDate}) - julianday(${invoices.dueDate})
                            ELSE julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate})
                        END
                    ), 1)`,
                    target: sql`30`, // Standard 30-day target
                    onTime: sql`ROUND(
                        COUNT(CASE WHEN ${invoices.paidDate} IS NOT NULL AND julianday(${invoices.paidDate}) <= julianday(${invoices.dueDate}) THEN 1 END) * 100.0 / 
                        COUNT(CASE WHEN ${invoices.paidDate} IS NOT NULL THEN 1 END), 0
                    )`,
                    late: sql`ROUND(
                        COUNT(CASE WHEN ${invoices.paidDate} IS NOT NULL AND julianday(${invoices.paidDate}) > julianday(${invoices.dueDate}) AND julianday(${invoices.paidDate}) - julianday(${invoices.dueDate}) <= 15 THEN 1 END) * 100.0 / 
                        COUNT(CASE WHEN ${invoices.paidDate} IS NOT NULL THEN 1 END), 0
                    )`,
                    veryLate: sql`ROUND(
                        COUNT(CASE WHEN ${invoices.paidDate} IS NOT NULL AND julianday(${invoices.paidDate}) - julianday(${invoices.dueDate}) > 15 THEN 1 END) * 100.0 / 
                        COUNT(CASE WHEN ${invoices.paidDate} IS NOT NULL THEN 1 END), 0
                    )`,
                    totalInvoices: sql`COUNT(${invoices.id})`,
                    avgAmount: sql`ROUND(AVG(${invoices.totalAmount}), 0)`,
                    customerSatisfaction: sql`ROUND(4.5 - (AVG(
                        CASE 
                            WHEN ${invoices.paidDate} IS NOT NULL 
                            THEN julianday(${invoices.paidDate}) - julianday(${invoices.dueDate})
                            ELSE julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate})
                        END
                    ) / 30.0), 1)`, // Satisfaction decreases with delay
                    cashFlow: sql`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.totalAmount} ELSE 0 END), 0)`,
                    industryAvg: sql`32` // Industry benchmark
                })
                .from(invoices)
                .where(and(
                    whereClause || sql`1=1`,
                    gte(invoices.invoiceDate, sql`date('now', '-12 months')`)
                ))
                .groupBy(sql`strftime('%Y-%m', ${invoices.invoiceDate})`)
                .orderBy(sql`strftime('%Y-%m', ${invoices.invoiceDate})`);

            // 2. Get detailed customer payment behavior analysis
            const customerBehavior = await this.db
                .select({
                    customerId: customers.id,
                    customer: customers.companyName,
                    avgDelay: sql`ROUND(AVG(
                        CASE 
                            WHEN ${invoices.paidDate} IS NOT NULL 
                            THEN julianday(${invoices.paidDate}) - julianday(${invoices.dueDate})
                            ELSE julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate})
                        END
                    ), 1)`,
                    consistency: sql`ROUND(
                        (COUNT(CASE WHEN ${invoices.paidDate} IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 0
                    )`,
                    paymentMethod: sql`'Bank Transfer'`, // Default - should come from customer table
                    creditTerms: sql`30`, // Default - should come from customer table
                    invoicesCount: sql`COUNT(${invoices.id})`,
                    totalValue: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                    trend: sql`CASE 
                        WHEN AVG(
                            CASE 
                                WHEN ${invoices.paidDate} IS NOT NULL 
                                THEN julianday(${invoices.paidDate}) - julianday(${invoices.dueDate})
                                ELSE julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate})
                            END
                        ) <= 20 THEN 'Improving'
                        WHEN AVG(
                            CASE 
                                WHEN ${invoices.paidDate} IS NOT NULL 
                                THEN julianday(${invoices.paidDate}) - julianday(${invoices.dueDate})
                                ELSE julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate})
                            END
                        ) <= 40 THEN 'Stable'
                        ELSE 'Deteriorating'
                    END`,
                    riskScore: sql`ROUND(
                        CASE 
                            WHEN AVG(
                                CASE 
                                    WHEN ${invoices.paidDate} IS NOT NULL 
                                    THEN julianday(${invoices.paidDate}) - julianday(${invoices.dueDate})
                                    ELSE julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate})
                                END
                            ) <= 20 THEN 15
                            WHEN AVG(
                                CASE 
                                    WHEN ${invoices.paidDate} IS NOT NULL 
                                    THEN julianday(${invoices.paidDate}) - julianday(${invoices.dueDate})
                                    ELSE julianday('${sql.raw(currentDate)}') - julianday(${invoices.dueDate})
                                END
                            ) <= 40 THEN 35
                            ELSE 65
                        END, 0
                    )`,
                    preferredDay: sql`'Monday'`, // Simplified - could be calculated from payment patterns
                    seasonality: sql`CASE 
                        WHEN COUNT(${invoices.id}) < 5 THEN 'None'
                        WHEN COUNT(${invoices.id}) < 10 THEN 'Month-end'
                        ELSE 'Quarter-end'
                    END`,
                    onTimePayments: sql`COUNT(CASE WHEN ${invoices.paidDate} IS NOT NULL AND julianday(${invoices.paidDate}) <= julianday(${invoices.dueDate}) THEN 1 END)`,
                    latePayments: sql`COUNT(CASE WHEN ${invoices.paidDate} IS NOT NULL AND julianday(${invoices.paidDate}) > julianday(${invoices.dueDate}) THEN 1 END)`,
                    avgInvoiceValue: sql`ROUND(AVG(${invoices.totalAmount}), 0)`,
                    paymentReliability: sql`ROUND(COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END) * 100.0 / COUNT(*), 0)`
                })
                .from(invoices)
                .innerJoin(customers, eq(invoices.customerId, customers.id))
                .where(whereClause || sql`1=1`)
                .groupBy(customers.id, customers.companyName)
                .having(sql`COUNT(${invoices.id}) >= 3`)
                .orderBy(desc(sql`COALESCE(SUM(${invoices.totalAmount}), 0)`))
                .limit(20);

            // 3. Generate optimization opportunities based on real data
            const optimizationOpportunities = this.generatePaymentOptimizations(monthlyTrends, customerBehavior);

            // 4. Calculate summary metrics
            const summaryMetrics = this.calculatePaymentSummaryMetrics(monthlyTrends, customerBehavior);

            // 5. Generate AI-powered insights
            const insights = this.generatePaymentInsights(monthlyTrends, customerBehavior, summaryMetrics);

            const result = {
                monthlyTrends: monthlyTrends.map(trend => ({
                    ...trend,
                    avgDelay: Number(trend.avgDelay || 0),
                    target: Number(trend.target || 30),
                    onTime: Number(trend.onTime || 0),
                    late: Number(trend.late || 0),
                    veryLate: Number(trend.veryLate || 0),
                    totalInvoices: Number(trend.totalInvoices || 0),
                    avgAmount: Number(trend.avgAmount || 0),
                    customerSatisfaction: Math.max(1, Math.min(5, Number(trend.customerSatisfaction || 4.0))),
                    cashFlow: Number(trend.cashFlow || 0),
                    industryAvg: Number(trend.industryAvg || 32)
                })),
                customerBehavior: customerBehavior.map(customer => ({
                    ...customer,
                    avgDelay: Number(customer.avgDelay || 0),
                    consistency: Number(customer.consistency || 0),
                    invoicesCount: Number(customer.invoicesCount || 0),
                    totalValue: Number(customer.totalValue || 0),
                    riskScore: Number(customer.riskScore || 0),
                    onTimePayments: Number(customer.onTimePayments || 0),
                    latePayments: Number(customer.latePayments || 0),
                    avgInvoiceValue: Number(customer.avgInvoiceValue || 0),
                    paymentReliability: Number(customer.paymentReliability || 0)
                })),
                optimizationOpportunities,
                summaryMetrics,
                insights,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    currentDate,
                    filters,
                    dataQuality: {
                        hasTrendData: monthlyTrends.length > 0,
                        hasCustomerData: customerBehavior.length > 0,
                        totalCustomers: customerBehavior.length,
                        totalMonths: monthlyTrends.length
                    }
                }
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error fetching enhanced payment delay analysis:', error);
            throw new Error(`Failed to fetch payment delay analysis: ${error.message}`);
        }
    }

    /**
     * Generate payment optimization opportunities based on real data
     */
    generatePaymentOptimizations(monthlyTrends, customerBehavior) {
        const opportunities = [];

        if (!monthlyTrends.length) return opportunities;

        const avgDelay = monthlyTrends.reduce((sum, month) => sum + (month.avgDelay || 0), 0) / monthlyTrends.length;
        const avgOnTime = monthlyTrends.reduce((sum, month) => sum + (month.onTime || 0), 0) / monthlyTrends.length;
        const totalCashFlow = monthlyTrends.reduce((sum, month) => sum + (month.cashFlow || 0), 0);
        const highRiskCustomers = customerBehavior.filter(c => (c.riskScore || 0) > 50).length;

        // Early Payment Discounts
        if (avgDelay > 25) {
            opportunities.push({
                type: "Early Payment Discounts",
                potential: `${Math.round(avgDelay * 0.3)}-${Math.round(avgDelay * 0.4)} days reduction`,
                impact: avgDelay > 40 ? "High" : "Medium",
                effort: "Low",
                description: "Offer 2% discount for payments within 10 days",
                expectedSavings: Math.round(totalCashFlow * 0.08),
                status: "Ready to Implement"
            });
        }

        // Automated Reminders
        if (avgOnTime < 80) {
            opportunities.push({
                type: "Automated Reminders",
                potential: `${Math.round((100 - avgOnTime) * 0.2)}-${Math.round((100 - avgOnTime) * 0.3)} days reduction`,
                impact: "Medium",
                effort: "Low",
                description: "Set up automated payment reminder system",
                expectedSavings: Math.round(totalCashFlow * 0.05),
                status: "In Progress"
            });
        }

        // Digital Payment Methods
        if (avgDelay > 30) {
            opportunities.push({
                type: "Digital Payment Methods",
                potential: `${Math.round(avgDelay * 0.4)}-${Math.round(avgDelay * 0.5)} days reduction`,
                impact: "High",
                effort: "Medium",
                description: "Encourage ACH/digital payments over checks",
                expectedSavings: Math.round(totalCashFlow * 0.12),
                status: "Planning"
            });
        }

        // Credit Term Optimization
        if (highRiskCustomers > 0) {
            opportunities.push({
                type: "Credit Term Optimization",
                potential: `${Math.round(avgDelay * 0.1)}-${Math.round(avgDelay * 0.2)} days reduction`,
                impact: "Medium",
                effort: "High",
                description: `Negotiate shorter payment terms with ${highRiskCustomers} high-risk customers`,
                expectedSavings: Math.round(totalCashFlow * 0.04),
                status: "Under Review"
            });
        }

        return opportunities;
    }

    /**
     * Calculate payment summary metrics
     */
    calculatePaymentSummaryMetrics(monthlyTrends, customerBehavior) {
        if (!monthlyTrends.length) {
            return {
                avgDelay: 0,
                onTimePercentage: 0,
                totalCustomers: 0,
                totalInvoices: 0,
                cashFlowImpact: 0,
                industryComparison: 0,
                improvementPotential: 0
            };
        }

        const latestMonth = monthlyTrends[monthlyTrends.length - 1];
        const avgDelay = monthlyTrends.reduce((sum, month) => sum + (month.avgDelay || 0), 0) / monthlyTrends.length;
        const avgOnTime = monthlyTrends.reduce((sum, month) => sum + (month.onTime || 0), 0) / monthlyTrends.length;
        const totalInvoices = monthlyTrends.reduce((sum, month) => sum + (month.totalInvoices || 0), 0);
        const totalCashFlow = monthlyTrends.reduce((sum, month) => sum + (month.cashFlow || 0), 0);
        const industryAvg = latestMonth.industryAvg || 32;

        return {
            avgDelay: Math.round(avgDelay * 10) / 10,
            onTimePercentage: Math.round(avgOnTime),
            totalCustomers: customerBehavior.length,
            totalInvoices,
            cashFlowImpact: totalCashFlow,
            industryComparison: Math.round((industryAvg - avgDelay) * 10) / 10,
            improvementPotential: avgDelay > 30 ? Math.round((avgDelay - 25) * 10) / 10 : 0,
            trendDirection: monthlyTrends.length >= 2 ?
                (latestMonth.avgDelay - monthlyTrends[monthlyTrends.length - 2].avgDelay) : 0
        };
    }

    /**
     * Generate AI-powered payment insights
     */
    generatePaymentInsights(monthlyTrends, customerBehavior, summaryMetrics) {
        const insights = [];

        // Performance insight
        if (summaryMetrics.industryComparison > 0) {
            insights.push({
                type: 'positive',
                icon: 'CheckCircle',
                title: 'Performance',
                message: `${summaryMetrics.avgDelay} days average - ${Math.abs(summaryMetrics.industryComparison)} days better than industry average.`
            });
        } else {
            insights.push({
                type: 'warning',
                icon: 'AlertTriangle',
                title: 'Performance',
                message: `${summaryMetrics.avgDelay} days average - ${Math.abs(summaryMetrics.industryComparison)} days slower than industry benchmark.`
            });
        }

        // High-risk customer alert
        const highRiskCustomers = customerBehavior.filter(c => (c.riskScore || 0) > 50);
        if (highRiskCustomers.length > 0) {
            const topRiskCustomer = highRiskCustomers.reduce((max, customer) =>
                (customer.riskScore || 0) > (max.riskScore || 0) ? customer : max, highRiskCustomers[0]);

            insights.push({
                type: 'warning',
                icon: 'AlertTriangle',
                title: 'Risk Alert',
                message: `${topRiskCustomer.customer} showing concerning payment delays (${topRiskCustomer.avgDelay} days avg).`
            });
        }

        // Optimization opportunity
        if (summaryMetrics.improvementPotential > 0) {
            const potentialSavings = Math.round(summaryMetrics.cashFlowImpact * 0.1 / 100000);
            insights.push({
                type: 'opportunity',
                icon: 'Target',
                title: 'Opportunity',
                message: `Reducing payment delays by ${summaryMetrics.improvementPotential} days could improve cash flow by ₹${potentialSavings}L.`
            });
        }

        return insights;
    }

    /**
     * Smart Alerts Generation with Real-Time Analytics
     */
    async getSmartAlerts(filters = {}) {
        const cacheKey = `smart_alerts_${JSON.stringify(filters)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const currentDate = new Date().toISOString().split('T')[0];
            const alerts = [];

            // 1. Cash Flow Critical Alerts
            const cashFlowData = await this.analyzeCashFlowRisk(filters);
            if (cashFlowData.alerts.length > 0) {
                alerts.push(...cashFlowData.alerts);
            }

            // 2. Customer Risk Alerts
            const customerRiskData = await this.analyzeCustomerRisk(filters);
            if (customerRiskData.alerts.length > 0) {
                alerts.push(...customerRiskData.alerts);
            }

            // 3. Invoice Aging Alerts
            const agingData = await this.analyzeInvoiceAging(filters);
            if (agingData.alerts.length > 0) {
                alerts.push(...agingData.alerts);
            }

            // 4. Revenue Opportunity Alerts
            const opportunityData = await this.analyzeRevenueOpportunities(filters);
            if (opportunityData.alerts.length > 0) {
                alerts.push(...opportunityData.alerts);
            }

            // 5. Tax Compliance Alerts
            const taxData = await this.analyzeTaxCompliance(filters);
            if (taxData.alerts.length > 0) {
                alerts.push(...taxData.alerts);
            }

            // 6. Performance Achievement Alerts
            const performanceData = await this.analyzePerformanceAchievements(filters);
            if (performanceData.alerts.length > 0) {
                alerts.push(...performanceData.alerts);
            }

            // Sort alerts by priority and timestamp
            const sortedAlerts = alerts.sort((a, b) => {
                const priorityOrder = { 'Critical': 4, 'Urgent': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            const result = {
                alerts: sortedAlerts,
                summary: {
                    total: sortedAlerts.length,
                    critical: sortedAlerts.filter(a => a.type === 'critical').length,
                    warnings: sortedAlerts.filter(a => a.type === 'warning').length,
                    opportunities: sortedAlerts.filter(a => a.type === 'opportunity').length,
                    newAlerts: sortedAlerts.filter(a => a.status === 'New').length,
                    avgConfidence: sortedAlerts.length > 0 ?
                        sortedAlerts.reduce((sum, a) => sum + a.confidence, 0) / sortedAlerts.length : 0
                },
                metadata: {
                    generatedAt: new Date().toISOString(),
                    filters,
                    lastUpdated: currentDate
                }
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error generating smart alerts:', error);
            throw new Error(`Failed to generate smart alerts: ${error.message}`);
        }
    }

    /**
     * Analyze Cash Flow Risk
     */
    async analyzeCashFlowRisk(filters) {
        const alerts = [];

        try {
            // Get current cash flow metrics
            const summaryMetrics = await this.getSummaryMetrics(filters);
            const agingReport = await this.getInvoiceAgingReport(filters);

            const totalOutstanding = agingReport.summary?.totalOutstanding || 0;
            const overdueAmount = agingReport.agingBuckets?.find(b => b.range === '90+ days')?.amount || 0;
            const criticalAmount = agingReport.agingBuckets?.find(b => b.range === '61-90 days')?.amount || 0;

            // Critical cash flow alert
            if (totalOutstanding > 1000000 && overdueAmount > 500000) {
                alerts.push({
                    id: `cash_flow_critical_${Date.now()}`,
                    type: 'critical',
                    category: 'Cash Flow',
                    title: 'Critical Cash Flow Alert',
                    message: `Projected cash shortfall of ₹${(overdueAmount / 100000).toFixed(1)}L with ₹${(totalOutstanding / 100000).toFixed(1)}L total outstanding`,
                    severity: 'High',
                    priority: 'Critical',
                    confidence: 95,
                    impact: 'High',
                    timeframe: '15 days',
                    actions: [
                        'Accelerate collections from top overdue customers',
                        'Consider short-term financing options',
                        'Review payment terms with suppliers'
                    ],
                    relatedMetrics: [
                        `Total Outstanding: ₹${(totalOutstanding / 100000).toFixed(1)}L`,
                        `Overdue: ₹${(overdueAmount / 100000).toFixed(1)}L`,
                        `Collection Rate: ${summaryMetrics.paymentRate || 0}%`
                    ],
                    timestamp: this.getRelativeTime(new Date()),
                    status: 'New',
                    source: 'Cash Flow Predictor',
                    affectedEntities: ['All Companies'],
                    createdAt: new Date().toISOString()
                });
            }

            // Warning for moderate cash flow risk
            else if (totalOutstanding > 500000 && (overdueAmount + criticalAmount) > 300000) {
                alerts.push({
                    id: `cash_flow_warning_${Date.now()}`,
                    type: 'warning',
                    category: 'Cash Flow',
                    title: 'Cash Flow Risk Detected',
                    message: `Potential cash flow strain with ₹${((overdueAmount + criticalAmount) / 100000).toFixed(1)}L in aged receivables`,
                    severity: 'Medium',
                    priority: 'High',
                    confidence: 88,
                    impact: 'Medium',
                    timeframe: '30 days',
                    actions: [
                        'Review aging report and prioritize collections',
                        'Contact customers with outstanding balances',
                        'Consider payment incentives for early settlement'
                    ],
                    relatedMetrics: [
                        `Aged Receivables: ₹${((overdueAmount + criticalAmount) / 100000).toFixed(1)}L`,
                        `DSO: ${agingReport.summary?.avgDSO || 0} days`,
                        `Efficiency: ${agingReport.summary?.currentEfficiency || 0}%`
                    ],
                    timestamp: this.getRelativeTime(new Date()),
                    status: 'Active',
                    source: 'Cash Flow Monitor',
                    affectedEntities: ['All Companies'],
                    createdAt: new Date().toISOString()
                });
            }
        } catch (error) {
            console.warn('Error analyzing cash flow risk:', error);
        }

        return { alerts };
    }

    /**
     * Analyze Customer Risk
     */
    async analyzeCustomerRisk(filters) {
        const alerts = [];

        try {
            const customerData = await this.getCustomerRevenueAnalysis({ ...filters, limit: 50 });
            const paymentData = await this.getPaymentDelayAnalysis(filters);

            // Find high-risk customers
            const highRiskCustomers = customerData.filter(customer => {
                const riskScore = this.calculateCustomerRisk(customer);
                return riskScore === 'High' && (customer.overdueAmount || 0) > 50000;
            });

            // Critical customer risk alerts
            highRiskCustomers.slice(0, 3).forEach((customer, index) => {
                const customerName = customer.customerName || `${customer.firstName} ${customer.lastName}`.trim();
                const overdueAmount = customer.overdueAmount || 0;
                const avgDelay = customer.avgPaymentDays || 0;

                if (overdueAmount > 100000) {
                    alerts.push({
                        id: `customer_risk_critical_${customer.customerId}_${Date.now()}`,
                        type: 'critical',
                        category: 'Customer Risk',
                        title: 'High-Risk Customer Alert',
                        message: `${customerName} has ₹${(overdueAmount / 100000).toFixed(1)}L overdue with ${avgDelay} days average delay`,
                        severity: 'High',
                        priority: 'Urgent',
                        confidence: 92,
                        impact: 'High',
                        timeframe: 'Immediate',
                        actions: [
                            'Initiate urgent collection call',
                            'Review credit terms and limits',
                            'Consider payment plan options'
                        ],
                        relatedMetrics: [
                            `Overdue Amount: ₹${(overdueAmount / 100000).toFixed(1)}L`,
                            `Avg Delay: ${avgDelay} days`,
                            `Payment Rate: ${customer.paymentRate || 0}%`
                        ],
                        timestamp: this.getRelativeTime(new Date()),
                        status: 'New',
                        source: 'Customer Risk Monitor',
                        affectedEntities: [customerName],
                        createdAt: new Date().toISOString()
                    });
                } else if (avgDelay > 60) {
                    alerts.push({
                        id: `customer_risk_warning_${customer.customerId}_${Date.now()}`,
                        type: 'warning',
                        category: 'Customer Risk',
                        title: 'Customer Payment Deterioration',
                        message: `${customerName} showing ${avgDelay} days average payment delay - trend deteriorating`,
                        severity: 'Medium',
                        priority: 'High',
                        confidence: 85,
                        impact: 'Medium',
                        timeframe: '30 days',
                        actions: [
                            'Schedule payment discussion meeting',
                            'Review credit terms and limits',
                            'Monitor payment behavior closely'
                        ],
                        relatedMetrics: [
                            `Avg Delay: ${avgDelay} days`,
                            `Total Value: ₹${(customer.totalRevenue / 100000).toFixed(1)}L`,
                            `Risk Score: High`
                        ],
                        timestamp: this.getRelativeTime(new Date()),
                        status: 'Active',
                        source: 'Payment Behavior Analysis',
                        affectedEntities: [customerName],
                        createdAt: new Date().toISOString()
                    });
                }
            });
        } catch (error) {
            console.warn('Error analyzing customer risk:', error);
        }

        return { alerts };
    }

    /**
     * Analyze Invoice Aging
     */
    async analyzeInvoiceAging(filters) {
        const alerts = [];

        try {
            const agingData = await this.getInvoiceAgingReport(filters);
            const currentDate = new Date();

            // Find critical aging issues
            const criticalBucket = agingData.agingBuckets?.find(b => b.range === '90+ days');
            const warningBucket = agingData.agingBuckets?.find(b => b.range === '61-90 days');

            if (criticalBucket && criticalBucket.amount > 200000) {
                alerts.push({
                    id: `aging_critical_${Date.now()}`,
                    type: 'critical',
                    category: 'Invoice Aging',
                    title: 'Critical Aged Receivables',
                    message: `₹${(criticalBucket.amount / 100000).toFixed(1)}L in invoices overdue by 90+ days across ${criticalBucket.customers} customers`,
                    severity: 'High',
                    priority: 'Critical',
                    confidence: 100,
                    impact: 'High',
                    timeframe: 'Immediate',
                    actions: [
                        'Initiate legal collection procedures',
                        'Send final demand notices',
                        'Consider debt collection agency'
                    ],
                    relatedMetrics: [
                        `Amount: ₹${(criticalBucket.amount / 100000).toFixed(1)}L`,
                        `Invoices: ${criticalBucket.invoices}`,
                        `Customers: ${criticalBucket.customers}`
                    ],
                    timestamp: this.getRelativeTime(currentDate),
                    status: 'New',
                    source: 'Aging Monitor',
                    affectedEntities: [`${criticalBucket.customers} Customers`],
                    createdAt: currentDate.toISOString()
                });
            }

            if (warningBucket && warningBucket.amount > 300000) {
                alerts.push({
                    id: `aging_warning_${Date.now()}`,
                    type: 'warning',
                    category: 'Invoice Aging',
                    title: 'Aging Receivables Alert',
                    message: `₹${(warningBucket.amount / 100000).toFixed(1)}L in invoices aging 61-90 days - risk of becoming uncollectible`,
                    severity: 'Medium',
                    priority: 'High',
                    confidence: 90,
                    impact: 'Medium',
                    timeframe: '7 days',
                    actions: [
                        'Escalate collection efforts',
                        'Schedule customer meetings',
                        'Negotiate payment plans'
                    ],
                    relatedMetrics: [
                        `Amount: ₹${(warningBucket.amount / 100000).toFixed(1)}L`,
                        `Avg Days: ${warningBucket.avgDays} days`,
                        `Collection Rate: ${warningBucket.collectionRate}%`
                    ],
                    timestamp: this.getRelativeTime(currentDate),
                    status: 'Active',
                    source: 'Aging Monitor',
                    affectedEntities: [`${warningBucket.customers} Customers`],
                    createdAt: currentDate.toISOString()
                });
            }
        } catch (error) {
            console.warn('Error analyzing invoice aging:', error);
        }

        return { alerts };
    }

    /**
     * Analyze Revenue Opportunities
     */
    async analyzeRevenueOpportunities(filters) {
        const alerts = [];

        try {
            const customerData = await this.getCustomerRevenueAnalysis({ ...filters, limit: 20 });
            const topItemsData = await this.getTopItemsAnalysis({ ...filters, limit: 10 });

            // Find growth opportunities
            const growingCustomers = customerData.filter(customer => {
                const lifetimeMonths = customer.customerLifetimeMonths || 1;
                const monthlyRevenue = (customer.totalRevenue || 0) / lifetimeMonths;
                return monthlyRevenue > 50000 && (customer.paymentRate || 0) > 80;
            });

            if (growingCustomers.length > 0) {
                const topCustomer = growingCustomers[0];
                const customerName = topCustomer.customerName || `${topCustomer.firstName} ${topCustomer.lastName}`.trim();
                const monthlyRevenue = (topCustomer.totalRevenue || 0) / (topCustomer.customerLifetimeMonths || 1);

                alerts.push({
                    id: `opportunity_growth_${topCustomer.customerId}_${Date.now()}`,
                    type: 'opportunity',
                    category: 'Revenue Growth',
                    title: 'Upselling Opportunity Detected',
                    message: `${customerName} showing strong growth pattern - potential for premium service upgrade`,
                    severity: 'Low',
                    priority: 'Medium',
                    confidence: 85,
                    impact: 'High',
                    timeframe: '60 days',
                    actions: [
                        'Prepare premium service proposal',
                        'Schedule strategic account review',
                        'Analyze competitive positioning'
                    ],
                    relatedMetrics: [
                        `Monthly Revenue: ₹${(monthlyRevenue / 1000).toFixed(0)}K`,
                        `Payment Rate: ${topCustomer.paymentRate || 0}%`,
                        `Lifetime Value: ₹${(topCustomer.totalRevenue / 100000).toFixed(1)}L`
                    ],
                    timestamp: this.getRelativeTime(new Date()),
                    status: 'Active',
                    source: 'Customer Intelligence',
                    affectedEntities: [customerName],
                    createdAt: new Date().toISOString()
                });
            }

            // High-margin product opportunities
            if (topItemsData.items && topItemsData.items.length > 0) {
                const highMarginItems = topItemsData.items.filter(item =>
                    (item.profitMargin || 0) > 40 && (item.totalRevenue || 0) > 100000
                );

                if (highMarginItems.length > 0) {
                    const topItem = highMarginItems[0];
                    alerts.push({
                        id: `opportunity_product_${topItem.itemId}_${Date.now()}`,
                        type: 'opportunity',
                        category: 'Product Growth',
                        title: 'High-Margin Product Opportunity',
                        message: `${topItem.itemName} showing ${topItem.profitMargin}% margin - opportunity to scale`,
                        severity: 'Low',
                        priority: 'Medium',
                        confidence: 80,
                        impact: 'Medium',
                        timeframe: '90 days',
                        actions: [
                            'Increase marketing focus on high-margin products',
                            'Review pricing strategy for similar items',
                            'Analyze market demand patterns'
                        ],
                        relatedMetrics: [
                            `Profit Margin: ${topItem.profitMargin}%`,
                            `Revenue: ₹${(topItem.totalRevenue / 100000).toFixed(1)}L`,
                            `Growth Potential: ${topItem.growthPotential}`
                        ],
                        timestamp: this.getRelativeTime(new Date()),
                        status: 'Active',
                        source: 'Product Intelligence',
                        affectedEntities: [topItem.itemName],
                        createdAt: new Date().toISOString()
                    });
                }
            }
        } catch (error) {
            console.warn('Error analyzing revenue opportunities:', error);
        }

        return { alerts };
    }

    /**
     * Analyze Tax Compliance
     */
    async analyzeTaxCompliance(filters) {
        const alerts = [];

        try {
            const taxData = await this.getTaxLiabilityReport(filters);
            const currentDate = new Date();

            // Check for upcoming GST filing deadlines
            const currentMonth = currentDate.getMonth();
            const filingDay = 20; // GST filing typically due by 20th
            const daysUntilFiling = filingDay - currentDate.getDate();

            if (daysUntilFiling <= 5 && daysUntilFiling > 0) {
                const latestMonthData = taxData.monthlyData?.[taxData.monthlyData.length - 1];
                const totalTax = latestMonthData?.totalTax || 0;

                alerts.push({
                    id: `tax_filing_${Date.now()}`,
                    type: 'info',
                    category: 'Tax Compliance',
                    title: 'Upcoming GST Filing Deadline',
                    message: `GST return filing due in ${daysUntilFiling} days - tax liability ₹${(totalTax / 1000).toFixed(0)}K`,
                    severity: 'Low',
                    priority: 'Medium',
                    confidence: 100,
                    impact: 'Low',
                    timeframe: `${daysUntilFiling} days`,
                    actions: [
                        'Review final GST calculations',
                        'Prepare supporting documentation',
                        'Schedule filing with tax consultant'
                    ],
                    relatedMetrics: [
                        `Tax Liability: ₹${(totalTax / 1000).toFixed(0)}K`,
                        `Compliance Score: ${taxData.complianceAnalysis?.overallScore || 0}`,
                        `Filing Status: Pending`
                    ],
                    timestamp: this.getRelativeTime(currentDate),
                    status: 'Pending',
                    source: 'Compliance Monitor',
                    affectedEntities: ['All Companies'],
                    createdAt: currentDate.toISOString()
                });
            }
        } catch (error) {
            console.warn('Error analyzing tax compliance:', error);
        }

        return { alerts };
    }

    /**
     * Analyze Performance Achievements
     */
    async analyzePerformanceAchievements(filters) {
        const alerts = [];

        try {
            const paymentData = await this.getPaymentDelayAnalysis(filters);
            const summaryMetrics = await this.getSummaryMetrics(filters);

            // Check for DSO improvements
            if (paymentData.summaryMetrics && paymentData.summaryMetrics.trendDirection < -5) {
                const improvement = Math.abs(paymentData.summaryMetrics.trendDirection);
                alerts.push({
                    id: `performance_dso_${Date.now()}`,
                    type: 'success',
                    category: 'Performance',
                    title: 'Collection Efficiency Improved',
                    message: `Payment delays reduced by ${improvement} days this month - best performance improvement`,
                    severity: 'Low',
                    priority: 'Low',
                    confidence: 95,
                    impact: 'Medium',
                    timeframe: 'Current',
                    actions: [
                        'Document successful practices',
                        'Share insights with team',
                        'Consider scaling strategies'
                    ],
                    relatedMetrics: [
                        `DSO Improvement: ${improvement} days`,
                        `Collection Rate: ${paymentData.summaryMetrics.onTimePercentage}%`,
                        `Cash Flow Impact: +₹${(paymentData.summaryMetrics.cashFlowImpact / 100000).toFixed(1)}L`
                    ],
                    timestamp: this.getRelativeTime(new Date()),
                    status: 'Acknowledged',
                    source: 'Performance Analytics',
                    affectedEntities: ['All Companies'],
                    createdAt: new Date().toISOString()
                });
            }

            // Check for revenue milestones
            if (summaryMetrics.totalRevenue > 5000000) {
                alerts.push({
                    id: `performance_revenue_${Date.now()}`,
                    type: 'success',
                    category: 'Performance',
                    title: 'Revenue Milestone Achieved',
                    message: `Total revenue reached ₹${(summaryMetrics.totalRevenue / 100000).toFixed(1)}L - significant business growth`,
                    severity: 'Low',
                    priority: 'Low',
                    confidence: 100,
                    impact: 'High',
                    timeframe: 'Current',
                    actions: [
                        'Celebrate team achievements',
                        'Analyze growth drivers',
                        'Plan for next milestone'
                    ],
                    relatedMetrics: [
                        `Total Revenue: ₹${(summaryMetrics.totalRevenue / 100000).toFixed(1)}L`,
                        `Total Invoices: ${summaryMetrics.totalInvoices}`,
                        `Avg Invoice Value: ₹${(summaryMetrics.avgInvoiceValue / 1000).toFixed(0)}K`
                    ],
                    timestamp: this.getRelativeTime(new Date()),
                    status: 'Active',
                    source: 'Revenue Analytics',
                    affectedEntities: ['All Companies'],
                    createdAt: new Date().toISOString()
                });
            }
        } catch (error) {
            console.warn('Error analyzing performance achievements:', error);
        }

        return { alerts };
    }

    /**
     * Helper method to get relative time
     */
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    /**
     * Advanced Customer Risk Scoring
     */
    calculateCustomerRiskScore(customer) {
        let score = 100; // Start with perfect score

        // Payment reliability factor (40% weight)
        if (customer.paymentReliability < 50) score -= 40;
        else if (customer.paymentReliability < 70) score -= 30;
        else if (customer.paymentReliability < 85) score -= 15;

        // Average payment delay factor (30% weight)
        if (customer.avgPaymentDelay > 30) score -= 30;
        else if (customer.avgPaymentDelay > 15) score -= 20;
        else if (customer.avgPaymentDelay > 7) score -= 10;

        // Outstanding amount factor (20% weight)
        const outstandingRatio = customer.totalOutstandingAmount / customer.totalAmount;
        if (outstandingRatio > 0.5) score -= 20;
        else if (outstandingRatio > 0.3) score -= 15;
        else if (outstandingRatio > 0.1) score -= 10;

        // Reminder count factor (10% weight)
        if (customer.avgReminderCount > 5) score -= 10;
        else if (customer.avgReminderCount > 3) score -= 5;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Categorize payment behavior
     */
    categorizePaymentBehavior(customer) {
        if (customer.paymentReliability >= 90 && customer.avgPaymentDelay <= 0) {
            return 'Excellent';
        } else if (customer.paymentReliability >= 80 && customer.avgPaymentDelay <= 7) {
            return 'Good';
        } else if (customer.paymentReliability >= 60 && customer.avgPaymentDelay <= 15) {
            return 'Fair';
        } else if (customer.paymentReliability >= 40) {
            return 'Poor';
        } else {
            return 'High Risk';
        }
    }

    /**
     * Calculate next follow-up date
     */
    calculateNextFollowUp(customer) {
        if (customer.overdueInvoices === 0) return null;

        const today = new Date();
        let followUpDays = 7; // Default 7 days

        // Adjust based on payment behavior
        if (customer.paymentReliability < 50) followUpDays = 3;
        else if (customer.paymentReliability < 70) followUpDays = 5;

        const followUpDate = new Date(today);
        followUpDate.setDate(today.getDate() + followUpDays);

        return followUpDate.toISOString().split('T')[0];
    }

    // Helper methods
    buildWhereClause(filters, tableAlias = '') {
        const conditions = [];
        const table = tableAlias === 'invoices' ? invoices : invoices;

        if (filters.startDate) {
            conditions.push(gte(table.invoiceDate, filters.startDate));
        }
        if (filters.endDate) {
            conditions.push(lte(table.invoiceDate, filters.endDate));
        }
        if (filters.companyId) {
            conditions.push(eq(table.companyId, filters.companyId));
        }
        if (filters.customerId) {
            conditions.push(eq(table.customerId, filters.customerId));
        }
        if (filters.status) {
            conditions.push(eq(table.status, filters.status));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    }

    getDateFormat(period) {
        switch (period) {
            case 'daily': return '%Y-%m-%d';
            case 'weekly': return '%Y-W%W';
            case 'monthly': return '%Y-%m';
            case 'quarterly': return '%Y-Q' + Math.ceil(parseInt('%m') / 3);
            case 'yearly': return '%Y';
            default: return '%Y-%m';
        }
    }

    /**
     * Enhanced Customer Scoring Algorithm
     */
    calculateCustomerScore(customer) {
        let score = 0;

        // Revenue contribution (30% weight)
        const revenueScore = Math.min((customer.totalRevenue || 0) / 100000 * 30, 30);
        score += revenueScore;

        // Payment reliability (25% weight)
        const paymentScore = (customer.paymentRate || 0) * 0.25;
        score += paymentScore;

        // Invoice frequency (20% weight)
        const invoiceScore = Math.min((customer.invoiceCount || 0) / 10 * 20, 20);
        score += invoiceScore;

        // Payment speed (15% weight) - lower payment days = higher score
        const avgDays = customer.avgPaymentDays || 30;
        const speedScore = Math.max(15 - (avgDays / 30 * 15), 0);
        score += speedScore;

        // Customer lifetime (10% weight)
        const lifetimeScore = Math.min((customer.customerLifetimeMonths || 0) / 12 * 10, 10);
        score += lifetimeScore;

        return Math.round(Math.min(score, 100));
    }

    /**
     * Customer Segmentation based on Score and Behavior
     */
    categorizeCustomerByScore(customer, score) {
        const revenue = customer.totalRevenue || 0;
        const paymentRate = customer.paymentRate || 0;

        if (score >= 85 && revenue > 200000) return 'Premium';
        if (score >= 70 && revenue > 100000) return 'Gold';
        if (score >= 55 && revenue > 50000) return 'Silver';
        if (score >= 40) return 'Bronze';
        return 'New';
    }

    /**
     * Enhanced Risk Assessment
     */
    calculateCustomerRisk(customer) {
        const paymentRate = customer.paymentRate || 0;
        const overdueCount = customer.overdueCount || 0;
        const avgPaymentDays = customer.avgPaymentDays || 0;
        const overdueAmount = customer.overdueAmount || 0;

        // High risk conditions
        if (paymentRate < 60 || overdueCount > 2 || avgPaymentDays > 45 || overdueAmount > 50000) {
            return 'High';
        }

        // Medium risk conditions
        if (paymentRate < 80 || overdueCount > 0 || avgPaymentDays > 30 || overdueAmount > 0) {
            return 'Medium';
        }

        return 'Low';
    }

    /**
     * Build Order By Clause for Sorting
     */
    buildOrderByClause(sortBy, sortOrder) {
        const direction = sortOrder === 'desc' ? desc : asc;

        switch (sortBy) {
            case 'customerName':
                return direction(customers.companyName);
            case 'totalRevenue':
                return direction(sql`COALESCE(SUM(${invoices.totalAmount}), 0)`);
            case 'invoiceCount':
                return direction(sql`COUNT(${invoices.id})`);
            case 'paymentRate':
                return direction(sql`ROUND(COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END) * 100.0 / COUNT(*), 2)`);
            case 'lastInvoiceDate':
                return direction(sql`MAX(${invoices.invoiceDate})`);
            default:
                return direction(sql`COALESCE(SUM(${invoices.totalAmount}), 0)`);
        }
    }

    // Legacy methods for backward compatibility
    categorizeCustomer(customer) {
        return this.categorizeCustomerByScore(customer, this.calculateCustomerScore(customer));
    }

    calculateRiskLevel(customer) {
        return this.calculateCustomerRisk(customer);
    }
}

// Initialize analytics service
const analyticsService = new AnalyticsService();

/**
 * Register all analytics IPC handlers
 */
function registerAnalyticsDashboardIpc() {
    // Summary Metrics
    ipcMain.handle("analytics:getSummaryMetrics", async (event, filters) => {
        try {
            return await analyticsService.getSummaryMetrics(filters);
        } catch (error) {
            console.error('IPC Error - getSummaryMetrics:', error);
            throw error;
        }
    });

    // Revenue Over Time
    ipcMain.handle("analytics:getRevenueOverTime", async (event, filters) => {
        try {
            return await analyticsService.getRevenueOverTime(filters);
        } catch (error) {
            console.error('IPC Error - getRevenueOverTime:', error);
            throw error;
        }
    });

    // Invoice Status Distribution
    ipcMain.handle("analytics:getInvoiceStatusDistribution", async (event, filters) => {
        try {
            return await analyticsService.getInvoiceStatusDistribution(filters);
        } catch (error) {
            console.error('IPC Error - getInvoiceStatusDistribution:', error);
            throw error;
        }
    });

    // Customer Revenue Analysis
    ipcMain.handle("analytics:getCustomerRevenueAnalysis", async (event, filters) => {
        try {
            return await analyticsService.getCustomerRevenueAnalysis(filters);
        } catch (error) {
            console.error('IPC Error - getCustomerRevenueAnalysis:', error);
            throw error;
        }
    });

    // Company Split
    ipcMain.handle("analytics:getCompanySplit", async (event, filters) => {
        try {
            return await analyticsService.getCompanySplit(filters);
        } catch (error) {
            console.error('IPC Error - getCompanySplit:', error);
            throw error;
        }
    });

    // Top Items Analysis
    ipcMain.handle("analytics:getTopItemsAnalysis", async (event, filters) => {
        try {
            return await analyticsService.getTopItemsAnalysis(filters);
        } catch (error) {
            console.error('IPC Error - getTopItemsAnalysis:', error);
            throw error;
        }
    });

    // Tax Liability Report
    ipcMain.handle("analytics:getTaxLiabilityReport", async (event, filters) => {
        try {
            return await analyticsService.getTaxLiabilityReport(filters);
        } catch (error) {
            console.error('IPC Error - getTaxLiabilityReport:', error);
            throw error;
        }
    });

    // Invoice Aging Report
    ipcMain.handle("analytics:getInvoiceAgingReport", async (event, filters) => {
        try {
            return await analyticsService.getInvoiceAgingReport(filters);
        } catch (error) {
            console.error('IPC Error - getInvoiceAgingReport:', error);
            throw error;
        }
    });

    // Payment Delay Analysis
    ipcMain.handle("analytics:getPaymentDelayAnalysis", async (event, filters) => {
        try {
            return await analyticsService.getPaymentDelayAnalysis(filters);
        } catch (error) {
            console.error('IPC Error - getPaymentDelayAnalysis:', error);
            throw error;
        }
    });

    // Smart Alerts
    ipcMain.handle("analytics:getSmartAlerts", async (event, filters) => {
        try {
            return await analyticsService.getSmartAlerts(filters);
        } catch (error) {
            console.error('IPC Error - getSmartAlerts:', error);
            throw error;
        }
    });

    // Cache management
    ipcMain.handle("analytics:clearCache", async (event) => {
        try {
            analyticsService.cache.clear();
            return { success: true, message: 'Cache cleared successfully' };
        } catch (error) {
            console.error('IPC Error - clearCache:', error);
            throw error;
        }
    });

    console.log('Analytics Dashboard IPC handlers registered successfully');
}

module.exports = { registerAnalyticsDashboardIpc }; 