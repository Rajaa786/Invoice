image.pngconst DatabaseManager = require('./db/db.js');
const { invoices } = require('./db/schema/Invoice.js');
const { sql, eq } = require('drizzle-orm');

async function addSamplePayments() {
    console.log('🔧 Adding Sample Payment Data...\n');

    try {
        const dbManager = DatabaseManager.getInstance();
        const db = dbManager.getDatabase();

        // Get first 6 invoices to mark as paid
        const invoicesToUpdate = await db.select({
            id: invoices.id,
            invoiceNo: invoices.invoiceNo,
            dueDate: invoices.dueDate,
            totalAmount: invoices.totalAmount
        }).from(invoices).limit(6);

        console.log(`📊 Marking ${invoicesToUpdate.length} invoices as paid...\n`);

        // Payment delays: some early, some on time, some late
        const delayDays = [-3, 0, 5, 12, 20, 28]; // Days relative to due date
        const paymentMethods = ['bank_transfer', 'upi', 'cheque', 'cash', 'card', 'bank_transfer'];

        for (let i = 0; i < invoicesToUpdate.length; i++) {
            const invoice = invoicesToUpdate[i];
            const dueDate = new Date(invoice.dueDate);
            const paidDate = new Date(dueDate);
            paidDate.setDate(paidDate.getDate() + delayDays[i]);

            await db.update(invoices)
                .set({
                    status: 'paid',
                    paidDate: paidDate,
                    paymentMethod: paymentMethods[i],
                    paymentReference: `PAY-${Date.now()}-${i + 1}`,
                    updatedAt: new Date()
                })
                .where(eq(invoices.id, invoice.id));

            const delayText = delayDays[i] > 0 ? `${delayDays[i]} days late` :
                delayDays[i] < 0 ? `${Math.abs(delayDays[i])} days early` : 'on time';

            console.log(`✅ ${invoice.invoiceNo}: paid ${delayText} via ${paymentMethods[i]} (₹${invoice.totalAmount})`);
        }

        // Verify updates
        const stats = await db.select({
            total: sql`COUNT(*)`,
            paid: sql`COUNT(CASE WHEN status = 'paid' THEN 1 END)`,
            withPaidDate: sql`COUNT(CASE WHEN paid_date IS NOT NULL THEN 1 END)`
        }).from(invoices);

        console.log(`\n📈 Updated Statistics:`);
        console.log(`  - Total invoices: ${stats[0].total}`);
        console.log(`  - Paid invoices: ${stats[0].paid}`);
        console.log(`  - With payment dates: ${stats[0].withPaidDate}`);

        console.log('\n🚀 PaymentDelayChart should now show data!');
        console.log('   Refresh the analytics dashboard to see payment delay analysis.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addSamplePayments(); 