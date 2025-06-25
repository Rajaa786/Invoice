import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Classic Blue Template - Professional and elegant design
const colors = {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    accent: '#10b981',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    background: '#f8fafc',
    white: '#ffffff',
    success: '#059669',
    warning: '#d97706'
};

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: colors.text,
        backgroundColor: colors.white,
        padding: 20,
    },

    // Header Styles
    header: {
        backgroundColor: colors.primary,
        padding: 20,
        marginBottom: 20,
        borderRadius: 8,
    },

    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
        marginBottom: 5,
        letterSpacing: 2,
    },

    headerSubtitle: {
        fontSize: 14,
        color: colors.white,
        textAlign: 'center',
    },

    // Company and Invoice Info Section
    infoSection: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 15,
    },

    companyInfo: {
        flex: 3,
        backgroundColor: colors.background,
        padding: 15,
        borderRadius: 8,
        border: `1pt solid ${colors.border}`,
    },

    invoiceInfo: {
        flex: 2,
        backgroundColor: colors.white,
        padding: 15,
        borderRadius: 8,
        border: `1pt solid ${colors.border}`,
    },

    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },

    addressText: {
        fontSize: 10,
        color: colors.textSecondary,
        lineHeight: 1.4,
        marginBottom: 3,
    },

    gstinText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 6,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingBottom: 5,
        borderBottom: `0.5pt solid ${colors.border}`,
    },

    infoLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.textSecondary,
    },

    infoValue: {
        fontSize: 10,
        color: colors.text,
        fontWeight: 'bold',
    },

    // Customer Section
    customerSection: {
        backgroundColor: colors.background,
        padding: 15,
        marginBottom: 20,
        borderRadius: 8,
        border: `1pt solid ${colors.border}`,
    },

    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 5,
    },

    // Table Styles
    tableContainer: {
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
        border: `1pt solid ${colors.border}`,
    },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        padding: 12,
    },

    tableHeaderCell: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottom: `0.5pt solid ${colors.border}`,
        minHeight: 35,
        alignItems: 'center',
    },

    tableRowAlt: {
        backgroundColor: colors.background,
    },

    tableCell: {
        fontSize: 9,
        color: colors.text,
        paddingHorizontal: 4,
        display: 'flex',
        alignItems: 'center',
    },

    tableCellCenter: {
        textAlign: 'center',
    },

    tableCellRight: {
        textAlign: 'right',
    },

    // Column widths (percentages that add up to 100%)
    col1: { width: '6%' },   // Sl.
    col2: { width: '36%' },  // Description
    col3: { width: '12%' },  // HSN/SAC
    col4: { width: '8%' },   // Qty
    col5: { width: '14%' },  // Rate
    col6: { width: '8%' },   // Unit
    col7: { width: '16%' },  // Amount

    // Tax and Total Rows
    taxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: colors.background,
        borderBottom: `0.5pt solid ${colors.border}`,
    },

    taxLabel: {
        fontSize: 10,
        color: colors.text,
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
        padding: 15,
        backgroundColor: colors.success,
    },

    totalLabel: {
        fontSize: 14,
        color: colors.white,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    totalAmount: {
        fontSize: 16,
        color: colors.white,
        fontWeight: 'bold',
    },

    // Amount in Words
    amountWordsSection: {
        backgroundColor: colors.background,
        padding: 15,
        marginBottom: 20,
        borderRadius: 8,
        border: `1pt solid ${colors.border}`,
    },

    amountWordsTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 6,
    },

    amountWordsText: {
        fontSize: 11,
        color: colors.text,
        fontStyle: 'italic',
        fontWeight: 'bold',
    },

    // Footer Section
    footerSection: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 15,
    },

    declarationBox: {
        flex: 2,
        backgroundColor: colors.background,
        padding: 15,
        borderRadius: 8,
        border: `1pt solid ${colors.border}`,
    },

    signatureBox: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 15,
        borderRadius: 8,
        border: `1pt solid ${colors.border}`,
        alignItems: 'center',
    },

    declarationTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
    },

    declarationText: {
        fontSize: 9,
        color: colors.textSecondary,
        lineHeight: 1.4,
    },

    signatureArea: {
        minHeight: 50,
        marginBottom: 10,
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
        color: colors.text,
        textAlign: 'center',
    },

    // Footer
    footer: {
        textAlign: 'center',
        fontSize: 8,
        color: colors.textSecondary,
        fontStyle: 'italic',
        paddingTop: 20,
        borderTop: `0.5pt solid ${colors.border}`,
    },

    // Notes
    notesSection: {
        marginBottom: 15,
        padding: 12,
        backgroundColor: colors.background,
        borderRadius: 6,
        border: `0.5pt solid ${colors.border}`,
    },

    notesTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 5,
    },

    notesText: {
        fontSize: 9,
        color: colors.textSecondary,
        lineHeight: 1.3,
    },
});

// Helper functions (shared across all templates)
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

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertHundreds = (n) => {
        let result = "";
        if (n > 99) {
            result += ones[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n > 19) {
            result += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n > 0) {
            result += ones[n] + " ";
        }
        return result;
    };

    const convertToWords = (n) => {
        if (n === 0) return "Zero";
        let result = "";

        if (n >= 10000000) {
            result += convertHundreds(Math.floor(n / 10000000)) + "Crore ";
            n %= 10000000;
        }
        if (n >= 100000) {
            result += convertHundreds(Math.floor(n / 100000)) + "Lakh ";
            n %= 100000;
        }
        if (n >= 1000) {
            result += convertHundreds(Math.floor(n / 1000)) + "Thousand ";
            n %= 1000;
        }
        result += convertHundreds(n);
        return result.trim();
    };

    return convertToWords(Math.floor(num)) + " Only";
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
const InvoiceHeader = ({ invoice }) => (
    <View style={styles.header}>
        <Text style={styles.headerTitle}>TAX INVOICE</Text>
        <Text style={styles.headerSubtitle}>
            Invoice #{invoice.invoiceNumber || "INV-001"}
        </Text>
    </View>
);

const CompanyAndInvoiceInfo = ({ invoice }) => (
    <View style={styles.infoSection}>
        <View style={styles.companyInfo}>
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

        <View style={styles.invoiceInfo}>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Invoice No:</Text>
                <Text style={styles.infoValue}>{invoice.invoiceNumber || "INV-001"}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.invoiceDate)}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Due Date:</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Terms:</Text>
                <Text style={styles.infoValue}>30 Days</Text>
            </View>
        </View>
    </View>
);

const CustomerInfo = ({ invoice }) => (
    <View style={styles.customerSection}>
        <Text style={styles.sectionTitle}>Bill To</Text>
        <Text style={styles.customerName}>
            {invoice.customer?.name || invoice.customerName || "Customer Name"}
        </Text>
        {invoice.customer?.addressLine1 && (
            <Text style={styles.addressText}>{invoice.customer.addressLine1}</Text>
        )}
    </View>
);

const ItemsTable = ({ invoice, totals }) => {
    const items = invoice.items || [];

    return (
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

            <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>CGST ({totals.cgstRate}%)</Text>
                <Text style={styles.taxAmount}>{formatCurrency(totals.cgstAmount)}</Text>
            </View>

            <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>SGST ({totals.sgstRate}%)</Text>
                <Text style={styles.taxAmount}>{formatCurrency(totals.sgstAmount)}</Text>
            </View>

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalAmount}>{formatCurrency(totals.grandTotal)}</Text>
            </View>
        </View>
    );
};

const AmountInWords = ({ amount }) => (
    <View style={styles.amountWordsSection}>
        <Text style={styles.amountWordsTitle}>Amount in Words:</Text>
        <Text style={styles.amountWordsText}>
            INR {numberToWords(amount)}
        </Text>
    </View>
);

const Footer = ({ invoice }) => (
    <View style={styles.footerSection}>
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

// Main Classic Blue Template Component
export const ClassicBlueTemplate = (invoice) => {
    const totals = calculateTotals(invoice.items || [], invoice);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <InvoiceHeader invoice={invoice} />
                <CompanyAndInvoiceInfo invoice={invoice} />
                <CustomerInfo invoice={invoice} />
                <ItemsTable invoice={invoice} totals={totals} />
                <AmountInWords amount={totals.grandTotal} />
                <Footer invoice={invoice} />

                {invoice.customerNotes && (
                    <View style={styles.notesSection}>
                        <Text style={styles.notesTitle}>Notes:</Text>
                        <Text style={styles.notesText}>{invoice.customerNotes}</Text>
                    </View>
                )}

                <Text style={styles.footer}>
                    This is a Computer Generated Invoice
                </Text>
            </Page>
        </Document>
    );
};

export default ClassicBlueTemplate; 