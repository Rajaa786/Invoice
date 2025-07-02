const DatabaseManager = require('./db/db.js');
const { invoices } = require('./db/schema/Invoice.js');
const { customers } = require('./db/schema/Customer.js');
const { sql, eq } = require('drizzle-orm');

async function checkPaymentData() {
    try {
        console.log('=== PAYMENT DELAY DATA ANALYSIS ===\n');

        // Get database instance
        const dbManager = DatabaseManager.getInstance();
        const db = dbManager.getDatabase();

        // Check total invoices
        const totalInvoices = await db.select({ count: sql`COUNT(*)` }).from(invoices);
        console.log(`📊 Total invoices: ${totalInvoices[0]?.count || 0}`);

        // Check invoices with payment-related fields populated
        const paymentFieldStats = await db.select({
            totalInvoices: sql`COUNT(*)`,
            withDueDate: sql`COUNT(CASE WHEN due_date IS NOT NULL THEN 1 END)`,
            withPaidDate: sql`COUNT(CASE WHEN paid_date IS NOT NULL THEN 1 END)`,
            withPaymentMethod: sql`COUNT(CASE WHEN payment_method IS NOT NULL THEN 1 END)`,
            statusPaid: sql`COUNT(CASE WHEN status = 'paid' THEN 1 END)`,
            statusPending: sql`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
            statusDraft: sql`COUNT(CASE WHEN status = 'draft' THEN 1 END)`,
            statusOverdue: sql`COUNT(CASE WHEN status = 'overdue' THEN 1 END)`
        }).from(invoices);

        const stats = paymentFieldStats[0];
        console.log(`\n📋 Payment Field Statistics:`);
        console.log(`  - Invoices with due date: ${stats.withDueDate}/${stats.totalInvoices}`);
        console.log(`  - Invoices with paid date: ${stats.withPaidDate}/${stats.totalInvoices}`);
        console.log(`  - Invoices with payment method: ${stats.withPaymentMethod}/${stats.totalInvoices}`);
        console.log(`\n📊 Status Distribution:`);
        console.log(`  - Paid: ${stats.statusPaid}`);
        console.log(`  - Pending: ${stats.statusPending}`);
        console.log(`  - Draft: ${stats.statusDraft}`);
        console.log(`  - Overdue: ${stats.statusOverdue}`);

        // Show sample invoice data with payment fields
        const sampleInvoices = await db.select({
            id: invoices.id,
            invoiceNo: invoices.invoiceNo,
            invoiceDate: invoices.invoiceDate,
            dueDate: invoices.dueDate,
            paidDate: invoices.paidDate,
            status: invoices.status,
            totalAmount: invoices.totalAmount,
            paymentMethod: invoices.paymentMethod,
            paymentReference: invoices.paymentReference
        }).from(invoices).limit(5);

        console.log(`\n📋 Sample Invoice Payment Data:`);
        sampleInvoices.forEach(inv => {
            const invoiceDate = inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : 'null';
            const dueDate = inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : 'null';
            const paidDate = inv.paidDate ? new Date(inv.paidDate).toISOString().split('T')[0] : 'null';
            console.log(`  ${inv.invoiceNo}: ${inv.status} | Due: ${dueDate} | Paid: ${paidDate} | Amount: ₹${inv.totalAmount} | Method: ${inv.paymentMethod || 'null'}`);
        });

        // If we have any paid invoices, calculate delay samples
        if (stats.withPaidDate > 0) {
            const paymentDelays = await db.select({
                invoiceNo: invoices.invoiceNo,
                delayDays: sql`ROUND(julianday(paid_date) - julianday(due_date), 1)`,
                status: invoices.status,
                totalAmount: invoices.totalAmount
            }).from(invoices)
                .where(sql`paid_date IS NOT NULL AND due_date IS NOT NULL`)
                .limit(5);

            console.log(`\n⏱️  Payment Delay Samples:`);
            paymentDelays.forEach(delay => {
                const delayText = delay.delayDays > 0 ? `${delay.delayDays} days late` :
                    delay.delayDays < 0 ? `${Math.abs(delay.delayDays)} days early` : 'on time';
                console.log(`  ${delay.invoiceNo}: ${delayText} (₹${delay.totalAmount})`);
            });
        } else {
            console.log(`\n⚠️  No Payment Delay Data Available`);
            console.log(`   Reason: No invoices have both due_date and paid_date populated`);
        }

        // Suggest what's needed for payment delay analysis
        console.log(`\n💡 For Payment Delay Analysis, we need:`);
        console.log(`   1. Invoices with status 'paid' and populated paid_date`);
        console.log(`   2. Invoices with populated due_date`);
        console.log(`   3. Multiple customers with payment history`);
        console.log(`   4. Historical data spanning multiple months`);

        console.log(`\n🔧 Current Data State:`);
        console.log(`   - Most invoices are in 'draft' status (${stats.statusDraft}/${stats.totalInvoices})`);
        console.log(`   - No paid invoices with payment dates`);
        console.log(`   - Payment delay chart will show "No Data Available"`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking payment data:', error);
        process.exit(1);
    }
}

checkPaymentData(); 