const DatabaseManager = require("./db/db");
const { invoices } = require("./db/schema/Invoice");
const { customers } = require("./db/schema/Customer");
const { companies } = require("./db/schema/Company");
const { sql } = require("drizzle-orm");

async function checkDatabase() {
    console.log('🔍 Starting Simple Database Check...');

    try {
        const db = DatabaseManager.getInstance().getDatabase();

        // 1. Count invoices
        const invoiceCount = await db
            .select({ count: sql`COUNT(*)` })
            .from(invoices)
            .get();

        console.log(`📊 Total invoices: ${invoiceCount?.count || 0}`);

        // 2. Count companies
        const companyCount = await db
            .select({ count: sql`COUNT(*)` })
            .from(companies)
            .get();

        console.log(`📊 Total companies: ${companyCount?.count || 0}`);

        // 3. Count customers
        const customerCount = await db
            .select({ count: sql`COUNT(*)` })
            .from(customers)
            .get();

        console.log(`📊 Total customers: ${customerCount?.count || 0}`);

        if (invoiceCount?.count > 0) {
            // 4. Sample invoices
            const sampleInvoices = await db
                .select({
                    id: invoices.id,
                    invoiceNo: invoices.invoiceNo,
                    status: invoices.status,
                    totalAmount: invoices.totalAmount
                })
                .from(invoices)
                .limit(5);

            console.log('📋 Sample invoices:');
            sampleInvoices.forEach(inv => {
                console.log(`  - ${inv.invoiceNo}: ${inv.status}, ₹${inv.totalAmount}`);
            });

            // 5. Status distribution
            const statusDist = await db
                .select({
                    status: invoices.status,
                    count: sql`COUNT(*)`
                })
                .from(invoices)
                .groupBy(invoices.status);

            console.log('📊 Status distribution:');
            statusDist.forEach(s => {
                console.log(`  - ${s.status}: ${s.count}`);
            });
        } else {
            console.log('❌ No invoices found - this explains the 0 data in analytics!');
            console.log('💡 Create some invoices first to see analytics data.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkDatabase().then(() => {
    console.log('✅ Check complete');
    process.exit(0);
}).catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
}); 