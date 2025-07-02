const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { sql } = require('drizzle-orm');
const { invoices } = require('./db/schema/Invoice');
const { customers } = require("./db/schema/Customer");
const { companies } = require("./db/schema/Company");
const { eq, and, gte, lte } = require("drizzle-orm");

console.log('🔍 Starting Invoice Status Debug Analysis...');

async function debugInvoiceData() {
    let sqlite;
    try {
        // Initialize database connection - try multiple paths
        const dbPaths = [
            'db.sqlite3',
            './db.sqlite3',
            '../db.sqlite3',
            'frontend/db.sqlite3'
        ];

        let dbPath = null;
        for (const path of dbPaths) {
            try {
                const fs = require('fs');
                if (fs.existsSync(path)) {
                    dbPath = path;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!dbPath) {
            console.log('❌ No database file found in any of the expected locations');
            return;
        }

        console.log(`📋 Using database: ${dbPath}`);
        sqlite = new Database(dbPath);
        const db = drizzle(sqlite);

        // 1. Check if tables exist
        const tables = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table'`);
        console.log('📋 Available tables:', tables.map(t => t.name));

        // 2. Check invoices table structure
        if (tables.find(t => t.name === 'invoices')) {
            const tableInfo = await db.all(sql`PRAGMA table_info(invoices)`);
            console.log('📋 Invoices table structure:');
            tableInfo.forEach(col => {
                console.log(`  - ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
            });

            // 3. Count total invoices
            const totalCount = await db
                .select({ count: sql`COUNT(*)` })
                .from(invoices)
                .get();
            console.log(`📊 Total invoices in database: ${totalCount?.count || 0}`);

            if (totalCount?.count > 0) {
                // 4. Check status distribution
                const statusDistribution = await db
                    .select({
                        status: invoices.status,
                        count: sql`COUNT(*)`,
                        totalAmount: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`
                    })
                    .from(invoices)
                    .groupBy(invoices.status);

                console.log('📊 Status distribution:');
                statusDistribution.forEach(status => {
                    console.log(`  - ${status.status}: ${status.count} invoices, ₹${status.totalAmount}`);
                });

                // 5. Sample invoice data
                const sampleInvoices = await db
                    .select({
                        id: invoices.id,
                        invoiceNo: invoices.invoiceNo,
                        status: invoices.status,
                        totalAmount: invoices.totalAmount,
                        invoiceDate: invoices.invoiceDate,
                        companyId: invoices.companyId,
                        customerId: invoices.customerId
                    })
                    .from(invoices)
                    .limit(10);

                console.log('📊 Sample invoices:');
                sampleInvoices.forEach(inv => {
                    console.log(`  - ID: ${inv.id}, No: ${inv.invoiceNo}, Status: ${inv.status}, Amount: ₹${inv.totalAmount}, Company: ${inv.companyId}, Customer: ${inv.customerId}`);
                });

                // 6. Test the exact query from analytics
                console.log('🔍 Testing analytics query...');

                // Build WHERE clause like analytics service
                const whereClause = sql`1=1`; // No filters for this test

                const analyticsResult = await db
                    .select({
                        status: invoices.status,
                        count: sql`COUNT(*)`,
                        totalAmount: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
                        avgDays: sql`ROUND(julianday('now') - julianday(${invoices.invoiceDate}), 0)`,
                        avgAmount: sql`ROUND(AVG(${invoices.totalAmount}), 2)`
                    })
                    .from(invoices)
                    .where(whereClause)
                    .groupBy(invoices.status);

                console.log('📊 Analytics query result:');
                analyticsResult.forEach(result => {
                    console.log(`  - Status: ${result.status}, Count: ${result.count}, Amount: ₹${result.totalAmount}, AvgDays: ${result.avgDays}`);
                });

                // 7. Check for foreign key constraints
                console.log('🔍 Checking foreign key references...');

                const companiesCount = await db
                    .select({ count: sql`COUNT(*)` })
                    .from(companies)
                    .get();

                const customersCount = await db
                    .select({ count: sql`COUNT(*)` })
                    .from(customers)
                    .get();

                console.log(`📊 Companies: ${companiesCount?.count || 0}`);
                console.log(`📊 Customers: ${customersCount?.count || 0}`);

                // 8. Check for orphaned invoices
                const orphanedInvoices = await db
                    .select({
                        id: invoices.id,
                        invoiceNo: invoices.invoiceNo,
                        companyId: invoices.companyId,
                        customerId: invoices.customerId
                    })
                    .from(invoices)
                    .leftJoin(companies, eq(invoices.companyId, companies.id))
                    .leftJoin(customers, eq(invoices.customerId, customers.id))
                    .where(sql`${companies.id} IS NULL OR ${customers.id} IS NULL`)
                    .limit(5);

                if (orphanedInvoices.length > 0) {
                    console.log('⚠️ Found orphaned invoices (missing company or customer):');
                    orphanedInvoices.forEach(inv => {
                        console.log(`  - Invoice ${inv.invoiceNo}: Company ID ${inv.companyId}, Customer ID ${inv.customerId}`);
                    });
                }

                // 9. Test with date filtering (common issue)
                const recentInvoices = await db
                    .select({ count: sql`COUNT(*)` })
                    .from(invoices)
                    .where(gte(invoices.invoiceDate, sql`date('now', '-30 days')`))
                    .get();

                console.log(`📊 Invoices in last 30 days: ${recentInvoices?.count || 0}`);

            } else {
                console.log('❌ No invoices found in database!');
                console.log('💡 This explains why analytics show 0 data.');
                console.log('💡 You need to create some invoices first.');
            }
        } else {
            console.log('❌ Invoices table does not exist!');
        }

        // 10. Check other related tables
        if (tables.find(t => t.name === 'companies')) {
            const companiesCount = await db.select({ count: sql`COUNT(*)` }).from(companies).get();
            console.log(`📊 Companies: ${companiesCount?.count || 0}`);
        }

        if (tables.find(t => t.name === 'customers')) {
            const customersCount = await db.select({ count: sql`COUNT(*)` }).from(customers).get();
            console.log(`📊 Customers: ${customersCount?.count || 0}`);
        }

    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        if (sqlite) {
            sqlite.close();
        }
    }
}

// Run the debug analysis
debugInvoiceData().then(() => {
    console.log('🔍 Debug analysis complete!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
}); 