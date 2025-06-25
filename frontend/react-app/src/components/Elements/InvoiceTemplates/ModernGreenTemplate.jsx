import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Modern Green Template - Fresh and vibrant design
const colors = {
    primary: '#16a34a',      // Green-600
    secondary: '#22c55e',    // Green-500
    accent: '#84cc16',       // Lime-500
    text: '#0f172a',         // Slate-900
    textSecondary: '#64748b', // Slate-500
    border: '#e2e8f0',       // Slate-200
    background: '#f1f5f9',   // Slate-100
    white: '#ffffff',
    success: '#15803d',      // Green-700
    light: '#dcfce7'         // Green-100
};

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: colors.text,
        backgroundColor: colors.white,
        padding: 20,
    },

    // Modern Header with gradient-like effect
    header: {
        backgroundColor: colors.primary,
        padding: 25,
        marginBottom: 25,
        borderRadius: 12,
        position: 'relative',
    },

    headerAccent: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
        backgroundColor: colors.secondary,
        borderRadius: 12,
        opacity: 0.1,
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'left',
        marginBottom: 8,
        letterSpacing: 1,
    },

    headerSubtitle: {
        fontSize: 16,
        color: colors.white,
        textAlign: 'left',
        opacity: 0.9,
    },

    // Modern card-based layout
    cardContainer: {
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1pt solid ${colors.border}`,
        backgroundColor: colors.white,
    },

    cardHeader: {
        backgroundColor: colors.light,
        padding: 12,
        borderBottom: `1pt solid ${colors.border}`,
    },

    cardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    cardContent: {
        padding: 15,
    },

    // Company info with modern layout
    companySection: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 25,
    },

    companyInfo: {
        flex: 2,
    },

    invoiceInfo: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 15,
        borderRadius: 8,
        border: `1pt solid ${colors.border}`,
    },

    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },

    addressText: {
        fontSize: 10,
        color: colors.textSecondary,
        lineHeight: 1.5,
        marginBottom: 4,
    },

    gstinText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 8,
        padding: 4,
        backgroundColor: colors.light,
        borderRadius: 4,
        textAlign: 'center',
    },

    // Modern info rows
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    infoItem: {
        backgroundColor: colors.white,
        padding: 8,
        borderRadius: 6,
        border: `1pt solid ${colors.border}`,
        flex: 1,
        minWidth: '45%',
    },

    infoLabel: {
        fontSize: 9,
        color: colors.textSecondary,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    infoValue: {
        fontSize: 11,
        color: colors.text,
        fontWeight: 'bold',
    },

    // Customer section
    customerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },

    // Modern table design
    tableContainer: {
        marginBottom: 25,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1pt solid ${colors.border}`,
    },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        padding: 15,
    },

    tableHeaderCell: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    tableRow: {
        flexDirection: 'row',
        padding: 12,
        borderBottom: `0.5pt solid ${colors.border}`,
        minHeight: 40,
        alignItems: 'center',
    },

    tableRowAlt: {
        backgroundColor: colors.background,
    },

    tableCell: {
        fontSize: 9,
        color: colors.text,
        paddingHorizontal: 6,
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

    // Modern tax and total design
    taxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: colors.light,
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
        padding: 18,
        backgroundColor: colors.primary,
    },

    totalLabel: {
        fontSize: 16,
        color: colors.white,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    totalAmount: {
        fontSize: 18,
        color: colors.white,
        fontWeight: 'bold',
    },

    // Amount in words with modern styling
    amountWordsContainer: {
        backgroundColor: colors.light,
        padding: 18,
        marginBottom: 25,
        borderRadius: 10,
        border: `1pt solid ${colors.border}`,
    },

    amountWordsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    amountWordsText: {
        fontSize: 12,
        color: colors.text,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },

    // Modern footer design
    footerContainer: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 25,
    },

    declarationCard: {
        flex: 2,
        backgroundColor: colors.background,
        padding: 18,
        borderRadius: 10,
        border: `1pt solid ${colors.border}`,
    },

    signatureCard: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 18,
        borderRadius: 10,
        border: `2pt solid ${colors.primary}`,
        alignItems: 'center',
    },

    declarationTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    declarationText: {
        fontSize: 10,
        color: colors.textSecondary,
        lineHeight: 1.5,
    },

    signatureArea: {
        minHeight: 60,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
        border: `1pt dashed ${colors.border}`,
        borderRadius: 6,
        width: '100%',
    },

    signatureText: {
        fontSize: 10,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 6,
    },

    authorizedSignatory: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
    },

    // Modern footer
    footer: {
        textAlign: 'center',
        fontSize: 9,
        color: colors.textSecondary,
        paddingTop: 20,
        borderTop: `1pt solid ${colors.border}`,
        backgroundColor: colors.background,
        padding: 15,
        borderRadius: 8,
        fontStyle: 'italic',
    },

    // Notes section
    notesContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: colors.light,
        borderRadius: 8,
        border: `1pt solid ${colors.border}`,
    },

    notesTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
    },

    notesText: {
        fontSize: 10,
        color: colors.text,
        lineHeight: 1.4,
    },
});

// Helper functions (same as Classic Blue)
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

// Modern Green Template Components
const ModernHeader = ({ invoice }) => (
    <View style={styles.header}>
        <Text style={styles.headerTitle}>INVOICE</Text>
        <Text style={styles.headerSubtitle}>
            #{invoice.invoiceNumber || "INV-001"}
        </Text>
    </View>
);

const ModernCompanyInfo = ({ invoice }) => (
    <View style={styles.companySection}>
        <View style={styles.companyInfo}>
            <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Bill From</Text>
                </View>
                <View style={styles.cardContent}>
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
        </View>

        <View style={styles.invoiceInfo}>
            <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Invoice No</Text>
                    <Text style={styles.infoValue}>{invoice.invoiceNumber || "INV-001"}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>{formatDate(invoice.invoiceDate)}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Due Date</Text>
                    <Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Terms</Text>
                    <Text style={styles.infoValue}>30 Days</Text>
                </View>
            </View>
        </View>
    </View>
);

const ModernCustomerInfo = ({ invoice }) => (
    <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Bill To</Text>
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.customerName}>
                {invoice.customer?.name || invoice.customerName || "Customer Name"}
            </Text>
            {invoice.customer?.addressLine1 && (
                <Text style={styles.addressText}>{invoice.customer.addressLine1}</Text>
            )}
        </View>
    </View>
);

const ModernItemsTable = ({ invoice, totals }) => {
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

const ModernAmountInWords = ({ amount }) => (
    <View style={styles.amountWordsContainer}>
        <Text style={styles.amountWordsTitle}>Amount in Words:</Text>
        <Text style={styles.amountWordsText}>
            INR {numberToWords(amount)}
        </Text>
    </View>
);

const ModernFooter = ({ invoice }) => (
    <View style={styles.footerContainer}>
        <View style={styles.declarationCard}>
            <Text style={styles.declarationTitle}>Declaration</Text>
            <Text style={styles.declarationText}>
                We declare that this invoice shows the actual price of the goods described
                and that all particulars are true and correct. This invoice is generated
                electronically and is valid without signature.
            </Text>
        </View>

        <View style={styles.signatureCard}>
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

// Main Modern Green Template Component
export const ModernGreenTemplate = (invoice) => {
    const totals = calculateTotals(invoice.items || [], invoice);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <ModernHeader invoice={invoice} />
                <ModernCompanyInfo invoice={invoice} />
                <ModernCustomerInfo invoice={invoice} />
                <ModernItemsTable invoice={invoice} totals={totals} />
                <ModernAmountInWords amount={totals.grandTotal} />
                <ModernFooter invoice={invoice} />

                {invoice.customerNotes && (
                    <View style={styles.notesContainer}>
                        <Text style={styles.notesTitle}>Notes:</Text>
                        <Text style={styles.notesText}>{invoice.customerNotes}</Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text>This is a Computer Generated Invoice • Generated on {new Date().toLocaleDateString()}</Text>
                </View>
            </Page>
        </Document>
    );
};

export default ModernGreenTemplate; 