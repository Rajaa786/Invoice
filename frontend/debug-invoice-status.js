const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { sql } = require('drizzle-orm');
const { invoices } = require('./db/schema/Invoice');

// Initialize database connection
const sqlite = new Database('db.sqlite3');
const db = drizzle(sqlite);

async function debugInvoiceStatus() {
    console.log('🔍 Starting Invoice Status Debug...');
    
    try {
        // 1. Check if invoices table exists
        const tableCheck = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table' AND name='invoices'`);
        console.log('📋 Invoices table exists:', tableCheck.length > 0);
        
        // 2. Check table structure
        const tableInfo = await db.all(sql`PRAGMA table_info(invoices)`);
        console.log('📋 Table structure:');
        tableInfo.forEach(col => {
            console.log(`  - ${col.name}: ${col.type} (${col.notnull ? 'NOT NULL' : 'NULL'}) ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
        });
        
        // 3. Count total invoices
        const totalCount = await db
            .select({ count: sql`COUNT(*)` })
            .from(invoices)
            .get();
        console.log('📊 Total invoices:', totalCount?.count || 0);
        
        // 4. Check if status column exists
        const hasStatusColumn = tableInfo.some(col => col.name === 'status');
        console.log('📊 Status column exists:', hasStatusColumn);
        
        // 5. If invoices exist, check status distribution
        if (totalCount?.count > 0) {
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
            
            // 6. Sample invoice data
            const sampleInvoices = await db
                .select({
                    id: invoices.id,
                    invoiceNo: invoices.invoiceNo,
                    status: invoices.status,
                    totalAmount: invoices.totalAmount,
                    invoiceDate: invoices.invoiceDate
                })
                .from(invoices)
                .limit(5);
            
            console.log('📊 Sample invoices:');
            sampleInvoices.forEach(inv => {
                console.log(`  - ${inv.invoiceNo}: ${inv.status}, ₹${inv.totalAmount}, ${inv.invoiceDate}`);
            });
        } else {
            console.log('❌ No invoices found in database');
        }
        
    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        sqlite.close();
    }
}

// Run the debug function
debugInvoiceStatus().then(() => {
    console.log('✅ Debug completed');
    process.exit(0);
}).catch(err => {
    console.error('❌ Debug failed:', err);
    process.exit(1);
}); 