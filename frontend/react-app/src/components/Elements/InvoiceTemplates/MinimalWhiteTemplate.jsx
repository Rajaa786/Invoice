import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Minimal White Template - Clean and minimalist design
const colors = {
    primary: '#000000',      // Black
    secondary: '#333333',    // Dark Gray
    accent: '#666666',       // Medium Gray
    text: '#000000',         // Black
    textSecondary: '#666666', // Gray
    border: '#cccccc',       // Light Gray
    background: '#f9f9f9',   // Very Light Gray
    white: '#ffffff',
    success: '#333333',      // Dark Gray
    light: '#f5f5f5'         // Light Gray
};

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: colors.text,
        backgroundColor: colors.white,
        padding: 25,
    },

    // Minimal header
    header: {
        borderBottom: `2pt solid ${colors.primary}`,
        paddingBottom: 20,
        marginBottom: 30,
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        letterSpacing: 3,
        marginBottom: 5,
    },

    headerSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    // Clean section layout
    section: {
        marginBottom: 25,
    },

    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottom: `1pt solid ${colors.border}`,
        paddingBottom: 5,
    },

    // Company and invoice info
    infoRow: {
        flexDirection: 'row',
        gap: 30,
        marginBottom: 25,
    },

    companyInfo: {
        flex: 1,
    },

    invoiceInfo: {
        flex: 1,
    },

    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },

    addressText: {
        fontSize: 10,
        color: colors.textSecondary,
        lineHeight: 1.5,
        marginBottom: 3,
    },

    gstinText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 8,
    },

    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },

    detailLabel: {
        fontSize: 10,
        color: colors.textSecondary,
        fontWeight: 'bold',
    },

    detailValue: {
        fontSize: 10,
        color: colors.text,
        fontWeight: 'bold',
    },

    // Customer section
    customerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },

    // Clean table design
    tableContainer: {
        marginBottom: 25,
        border: `1pt solid ${colors.border}`,
    },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.light,
        borderBottom: `1pt solid ${colors.border}`,
        padding: 10,
    },

    tableHeaderCell: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },

    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottom: `0.5pt solid ${colors.border}`,
        minHeight: 30,
        alignItems: 'center',
    },

    tableRowAlt: {
        backgroundColor: colors.background,
    },

    tableCell: {
        fontSize: 9,
        color: colors.text,
        paddingHorizontal: 3,
    },

    tableCellCenter: {
        textAlign: 'center',
    },

    tableCellRight: {
        textAlign: 'right',
    },

    // Column widths
    col1: { width: '6%' },
    col2: { width: '36%' },
    col3: { width: '12%' },
    col4: { width: '8%' },
    col5: { width: '14%' },
    col6: { width: '8%' },
    col7: { width: '16%' },

    // Clean summary design
    summaryContainer: {
        borderTop: `1pt solid ${colors.border}`,
        paddingTop: 15,
    },

    taxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        borderBottom: `0.5pt solid ${colors.border}`,
    },

    taxLabel: {
        fontSize: 10,
        color: colors.textSecondary,
        fontWeight: 'bold',
    },

    taxAmount: {
        fontSize: 10,
        color: colors.text,
        fontWeight: 'bold',
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.primary,
        marginTop: 10,
    },

    totalLabel: {
        fontSize: 14,
        color: colors.white,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    totalAmount: {
        fontSize: 16,
        color: colors.white,
        fontWeight: 'bold',
    },

    // Amount in words
    amountWordsContainer: {
        padding: 15,
        backgroundColor: colors.background,
        marginBottom: 25,
        border: `1pt solid ${colors.border}`,
    },

    amountWordsTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },

    amountWordsText: {
        fontSize: 11,
        color: colors.text,
        fontStyle: 'italic',
    },

    // Footer
    footerRow: {
        flexDirection: 'row',
        gap: 25,
        marginBottom: 25,
    },

    declarationBox: {
        flex: 2,
        padding: 15,
        backgroundColor: colors.background,
        border: `1pt solid ${colors.border}`,
    },

    signatureBox: {
        flex: 1,
        padding: 15,
        border: `1pt solid ${colors.border}`,
        alignItems: 'center',
    },

    declarationTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },

    declarationText: {
        fontSize: 9,
        color: colors.textSecondary,
        lineHeight: 1.4,
    },

    signatureArea: {
        minHeight: 50,
        marginBottom: 10,
        border: `1pt dashed ${colors.border}`,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    signatureText: {
        fontSize: 9,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 5,
    },

    authorizedSignatory: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
    },

    // Page footer
    pageFooter: {
        textAlign: 'center',
        fontSize: 8,
        color: colors.textSecondary,
        paddingTop: 20,
        borderTop: `0.5pt solid ${colors.border}`,
    },

    // Notes
    notesContainer: {
        marginBottom: 20,
        padding: 12,
        backgroundColor: colors.background,
        border: `1pt solid ${colors.border}`,
    },

    notesTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 6,
    },

    notesText: {
        fontSize: 9,
        color: colors.text,
        lineHeight: 1.3,
    },
});

// Helper functions
const formatCurrency = (value) => {
    const numericValue = parseFloat(value) || 0;
    return "₹" + numericValue.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    });
};

const formatDate = (date) => {
    if (!date) return "";
    try {
        if (date instanceof Date) {
            return date.toLocaleDateString("en-GB");
        }
        return new Date(date).toLocaleDateString("en-GB");
    } catch (error) {
        return "Invalid Date";
    }
};

const numberToWords = (num) => {
    if (isNaN(num) || num === 0) return "Zero";
    // Implementation simplified for brevity
    return `${Math.floor(num)} Only`;
};

const calculateTotals = (items, invoice) => {
    const subtotal = items.reduce((sum, item) => {
        const amount = parseFloat(item.amount) || (parseFloat(item.quantity) * parseFloat(item.rate)) || 0;
        return sum + amount;
    }, 0);

    const cgstRate = parseFloat(invoice.cgstRate) || 9;
    const sgstRate = parseFloat(invoice.sgstRate) || 9;
    const cgstAmount = subtotal * (cgstRate / 100);
    const sgstAmount = subtotal * (sgstRate / 100);
    const grandTotal = subtotal + cgstAmount + sgstAmount;

    return { subtotal, cgstRate, sgstRate, cgstAmount, sgstAmount, grandTotal };
};

// Template Components
const MinimalHeader = ({ invoice }) => (
    <View style={styles.header}>
        <Text style={styles.headerTitle}>INVOICE</Text>
        <Text style={styles.headerSubtitle}>
            {invoice.invoiceNumber || "INV-001"}
        </Text>
    </View>
);

const MinimalInfoSection = ({ invoice }) => (
    <View style={styles.infoRow}>
        <View style={styles.companyInfo}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>From</Text>
                <Text style={styles.companyName}>
                    {invoice.company?.companyName || "Company Name"}
                </Text>
                {invoice.company?.addressLine1 && (
                    <Text style={styles.addressText}>{invoice.company.addressLine1}</Text>
                )}
                {invoice.company?.city && (
                    <Text style={styles.addressText}>{invoice.company.city}</Text>
                )}
                {invoice.company?.gstin && (
                    <Text style={styles.gstinText}>GSTIN: {invoice.company.gstin}</Text>
                )}
            </View>
        </View>

        <View style={styles.invoiceInfo}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Invoice Details</Text>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Invoice No:</Text>
                    <Text style={styles.detailValue}>{invoice.invoiceNumber || "INV-001"}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(invoice.invoiceDate)}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Due Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(invoice.dueDate)}</Text>
                </View>
            </View>
        </View>
    </View>
);

const MinimalCustomerSection = ({ invoice }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill To</Text>
        <Text style={styles.customerName}>
            {invoice.customer?.name || invoice.customerName || "Customer Name"}
        </Text>
        {invoice.customer?.addressLine1 && (
            <Text style={styles.addressText}>{invoice.customer.addressLine1}</Text>
        )}
    </View>
);

const MinimalItemsTable = ({ invoice, totals }) => {
    const items = invoice.items || [];

    return (
        <View>
            <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.col1]}>Sl.</Text>
                    <Text style={[styles.tableHeaderCell, styles.col2]}>Description</Text>
                    <Text style={[styles.tableHeaderCell, styles.col3]}>HSN/SAC</Text>
                    <Text style={[styles.tableHeaderCell, styles.col4]}>Qty</Text>
                    <Text style={[styles.tableHeaderCell, styles.col5]}>Rate</Text>
                    <Text style={[styles.tableHeaderCell, styles.col6]}>Unit</Text>
                    <Text style={[styles.tableHeaderCell, styles.col7]}>Amount</Text>
                </View>

                {items.map((item, index) => {
                    const qty = parseFloat(item.quantity) || 1;
                    const isEven = index % 2 === 0;

                    return (
                        <View key={index} style={[styles.tableRow, !isEven && styles.tableRowAlt]}>
                            <View style={[styles.col1]}>
                                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                                    {index + 1}
                                </Text>
                            </View>
                            <View style={[styles.col2]}>
                                <Text style={[styles.tableCell]}>
                                    {item.details || item.name || "Item"}
                                </Text>
                            </View>
                            <View style={[styles.col3]}>
                                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                                    {item.hsn || ""}
                                </Text>
                            </View>
                            <View style={[styles.col4]}>
                                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                                    {qty}
                                </Text>
                            </View>
                            <View style={[styles.col5]}>
                                <Text style={[styles.tableCell, styles.tableCellRight]}>
                                    {formatCurrency(item.rate || 0).replace('₹', '')}
                                </Text>
                            </View>
                            <View style={[styles.col6]}>
                                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                                    {item.per || "Nos"}
                                </Text>
                            </View>
                            <View style={[styles.col7]}>
                                <Text style={[styles.tableCell, styles.tableCellRight]}>
                                    {formatCurrency(item.amount || (qty * (item.rate || 0))).replace('₹', '')}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            <View style={styles.summaryContainer}>
                <View style={styles.taxRow}>
                    <Text style={styles.taxLabel}>CGST ({totals.cgstRate}%)</Text>
                    <Text style={styles.taxAmount}>{formatCurrency(totals.cgstAmount)}</Text>
                </View>
                <View style={styles.taxRow}>
                    <Text style={styles.taxLabel}>SGST ({totals.sgstRate}%)</Text>
                    <Text style={styles.taxAmount}>{formatCurrency(totals.sgstAmount)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(totals.grandTotal)}</Text>
                </View>
            </View>
        </View>
    );
};

const MinimalAmountInWords = ({ amount }) => (
    <View style={styles.amountWordsContainer}>
        <Text style={styles.amountWordsTitle}>Amount in Words:</Text>
        <Text style={styles.amountWordsText}>
            INR {numberToWords(amount)}
        </Text>
    </View>
);

const MinimalFooter = ({ invoice }) => (
    <View style={styles.footerRow}>
        <View style={styles.declarationBox}>
            <Text style={styles.declarationTitle}>Declaration</Text>
            <Text style={styles.declarationText}>
                We declare that this invoice shows the actual price of the goods described
                and that all particulars are true and correct.
            </Text>
        </View>

        <View style={styles.signatureBox}>
            <View style={styles.signatureArea}>
                {invoice.signature && (
                    <Image
                        src={invoice.signature}
                        style={{ width: 80, height: 40 }}
                    />
                )}
            </View>
            <Text style={styles.signatureText}>
                for {invoice.company?.companyName || "Company Name"}
            </Text>
            <Text style={styles.authorizedSignatory}>Authorized Signatory</Text>
        </View>
    </View>
);

// Main Minimal White Template Component
export const MinimalWhiteTemplate = (invoice) => {
    const totals = calculateTotals(invoice.items || [], invoice);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <MinimalHeader invoice={invoice} />
                <MinimalInfoSection invoice={invoice} />
                <MinimalCustomerSection invoice={invoice} />
                <MinimalItemsTable invoice={invoice} totals={totals} />
                <MinimalAmountInWords amount={totals.grandTotal} />
                <MinimalFooter invoice={invoice} />

                {invoice.customerNotes && (
                    <View style={styles.notesContainer}>
                        <Text style={styles.notesTitle}>Notes:</Text>
                        <Text style={styles.notesText}>{invoice.customerNotes}</Text>
                    </View>
                )}

                <Text style={styles.pageFooter}>
                    This is a Computer Generated Invoice
                </Text>
            </Page>
        </Document>
    );
};

export default MinimalWhiteTemplate; 