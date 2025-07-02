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
        fontSize: 8.5,
        color: colors.text,
        backgroundColor: colors.white,
        padding: 20,
        lineHeight: 1.3,
    },

    header: {
        backgroundColor: colors.white,
        marginBottom: 12,
        borderBottom: `2pt solid ${colors.primary}`,
        paddingBottom: 12,
    },

    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    logoContainer: {
        width: 120,
        height: 'auto',
        marginBottom: 8,
    },

    companyInfo: {
        flex: 1,
    },

    headerCompanyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 2,
        letterSpacing: 0.5,
    },

    headerTagline: {
        fontSize: 8,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },

    headerRight: {
        alignItems: 'flex-end',
    },

    taxInvoiceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 5,
        letterSpacing: 1,
    },

    invoiceNumberText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: 'bold',
    },

    infoSection: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',
    },

    companyInfoSection: {
        flex: 1.5,
        marginRight: 20,
    },

    invoiceInfoSection: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
    },

    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        borderBottom: `1pt solid ${colors.border}`,
        paddingBottom: 3,
    },

    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 6,
    },

    addressText: {
        fontSize: 9,
        color: colors.textSecondary,
        lineHeight: 1.3,
        marginBottom: 2,
    },

    gstinText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 4,
        backgroundColor: colors.background,
        padding: 3,
        borderRadius: 3,
    },

    customerSection: {
        backgroundColor: colors.background,
        padding: 8,
        marginBottom: 10,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
    },

    customerName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },

    tableContainer: {
        marginBottom: 8,
        borderRadius: 4,
        overflow: 'hidden',
        border: `1pt solid ${colors.border}`,
        backgroundColor: colors.white,
    },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        padding: 6,
    },

    tableHeaderCell: {
        color: colors.white,
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    tableRow: {
        flexDirection: 'row',
        padding: 3,
        borderBottom: `0.5pt solid ${colors.border}`,
        minHeight: 16,
        alignItems: 'center',
    },

    tableRowAlt: {
        backgroundColor: colors.background,
    },

    tableCell: {
        fontSize: 8,
        color: colors.text,
        paddingHorizontal: 3,
        paddingVertical: 1,
        display: 'flex',
        alignItems: 'center',
        lineHeight: 1.2,
    },

    tableCellCenter: {
        textAlign: 'center',
    },

    tableCellRight: {
        textAlign: 'right',
    },

    // Column widths
    col1: { width: '5%' },   // Sl.
    col2: { width: '40%' },  // Description
    col3: { width: '10%' },  // HSN/SAC
    col4: { width: '7%' },   // Qty
    col5: { width: '12%' },  // Rate
    col6: { width: '8%' },   // Unit
    col7: { width: '18%' },  // Amount

    taxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        backgroundColor: colors.background,
        borderBottom: `0.5pt solid ${colors.border}`,
    },

    taxLabel: {
        fontSize: 9,
        color: colors.text,
        fontWeight: 'bold',
    },

    taxAmount: {
        fontSize: 9,
        color: colors.text,
        fontWeight: 'bold',
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: colors.primary,
    },

    totalLabel: {
        fontSize: 11,
        color: colors.white,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    totalAmount: {
        fontSize: 12,
        color: colors.white,
        fontWeight: 'bold',
    },

    amountWordsSection: {
        backgroundColor: colors.background,
        padding: 8,
        marginBottom: 8,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
    },

    amountWordsTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },

    amountWordsText: {
        fontSize: 9,
        color: colors.text,
        fontStyle: 'italic',
        fontWeight: 'bold',
    },

    footerSection: {
        flexDirection: 'row',
        marginBottom: 6,
        gap: 8,
    },

    declarationBox: {
        flex: 2,
        backgroundColor: colors.background,
        padding: 10,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
    },

    signatureBox: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 10,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
        alignItems: 'center',
    },

    declarationTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 6,
        textTransform: 'uppercase',
    },

    declarationText: {
        fontSize: 8,
        color: colors.textSecondary,
        lineHeight: 1.3,
    },

    signatureArea: {
        minHeight: 25,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `1pt solid ${colors.border}`,
        width: '80%',
    },

    signatureText: {
        fontSize: 8,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 3,
    },

    authorizedSignatory: {
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
    },

    notesSection: {
        marginBottom: 8,
        padding: 8,
        backgroundColor: colors.background,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
    },

    notesTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },

    notesText: {
        fontSize: 8,
        color: colors.textSecondary,
        lineHeight: 1.3,
    },

    footer: {
        textAlign: 'center',
        fontSize: 7,
        color: colors.textSecondary,
        fontStyle: 'italic',
        paddingTop: 6,
        borderTop: `0.5pt solid ${colors.border}`,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        alignItems: 'center',
    },

    infoLabel: {
        fontSize: 9,
        color: colors.textSecondary,
        fontWeight: 'bold',
        flex: 1,
    },

    infoValue: {
        fontSize: 9,
        color: colors.text,
        fontWeight: 'bold',
        textAlign: 'right',
        flex: 1,
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
const MinimalHeader = ({ invoice, dynamicStyles }) => (
    <View style={styles.header}>
        <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
                <View style={styles.logoContainer}>
                    <Image
                        src={invoice.company?.logo || "/cyphersol-logo.png"}
                    />
                </View>
                <View style={styles.companyInfo}>
                    <Text style={styles.headerTagline}>
                        {invoice.company?.companyName || "Company Name"}
                    </Text>
                </View>
            </View>

            <View style={styles.headerRight}>
                <Text style={dynamicStyles?.taxInvoiceTitle || styles.taxInvoiceTitle}>
                    TAX INVOICE
                </Text>
                <Text style={styles.invoiceNumberText}>
                    {invoice.invoiceNumber || "INV-001"}
                </Text>
            </View>
        </View>
    </View>
);

const MinimalInfoSection = ({ invoice, dynamicStyles }) => (
    <View style={styles.infoSection}>
        <View style={styles.companyInfoSection}>
            <Text style={dynamicStyles?.sectionTitle || styles.sectionTitle}>Bill From</Text>
            <Text style={dynamicStyles?.companyName || styles.companyName}>
                {invoice.company?.companyName || "Company Name"}
            </Text>
            {invoice.company?.addressLine1 && (
                <Text style={styles.addressText}>{invoice.company.addressLine1}</Text>
            )}
            <Text style={styles.addressText}>
                {invoice.company?.city && `${invoice.company.city}, `}
                {invoice.company?.state && `${invoice.company.state} `}
                {invoice.company?.zip}
            </Text>
            {invoice.company?.phone && (
                <Text style={styles.addressText}>Ph: {invoice.company.phone}</Text>
            )}
            {invoice.company?.email && (
                <Text style={styles.addressText}>Email: {invoice.company.email}</Text>
            )}
            {invoice.company?.gstin && (
                <Text style={styles.gstinText}>GSTIN: {invoice.company.gstin}</Text>
            )}
        </View>

        <View style={styles.invoiceInfoSection}>
            <Text style={dynamicStyles?.sectionTitle || styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Invoice No:</Text>
                <Text style={styles.infoValue}>{invoice.invoiceNumber || "INV-001"}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.invoiceDate) || formatDate(new Date())}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Due Date:</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.dueDate) || formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Terms:</Text>
                <Text style={styles.infoValue}>{invoice.paymentTerms || "Net 30"}</Text>
            </View>
        </View>
    </View>
);

const MinimalCustomerSection = ({ invoice, dynamicStyles }) => (
    <View style={styles.customerSection}>
        <Text style={dynamicStyles?.sectionTitle || styles.sectionTitle}>Bill To</Text>
        <Text style={styles.customerName}>
            {invoice.customer?.name || invoice.customerName || "Customer Name"}
        </Text>
        {invoice.customer?.addressLine1 && (
            <Text style={styles.addressText}>{invoice.customer.addressLine1}</Text>
        )}
        <Text style={styles.addressText}>
            {invoice.customer?.city && `${invoice.customer.city}, `}
            {invoice.customer?.state && `${invoice.customer.state} `}
            {invoice.customer?.zip}
        </Text>
    </View>
);

const MinimalItemsTable = ({ invoice, totals, dynamicStyles }) => {
    const items = invoice.items || [];
    const tableHeaderCellStyle = dynamicStyles?.tableHeaderCell || styles.tableHeaderCell;
    const tableCellStyle = dynamicStyles?.tableCell || styles.tableCell;

    return (
        <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
                <Text style={[tableHeaderCellStyle, styles.col1]}>Sl.</Text>
                <Text style={[tableHeaderCellStyle, styles.col2]}>Description</Text>
                <Text style={[tableHeaderCellStyle, styles.col3]}>HSN/SAC</Text>
                <Text style={[tableHeaderCellStyle, styles.col4]}>Qty</Text>
                <Text style={[tableHeaderCellStyle, styles.col5]}>Rate</Text>
                <Text style={[tableHeaderCellStyle, styles.col6]}>Unit</Text>
                <Text style={[tableHeaderCellStyle, styles.col7]}>Amount</Text>
            </View>

            {items.map((item, index) => {
                const qty = parseFloat(item.quantity) || 1;
                const isEven = index % 2 === 0;

                return (
                    <View key={index} style={[styles.tableRow, !isEven && styles.tableRowAlt]}>
                        <View style={[styles.col1]}>
                            <Text style={[tableCellStyle, styles.tableCellCenter]}>
                                {index + 1}
                            </Text>
                        </View>
                        <View style={[styles.col2]}>
                            <Text style={[tableCellStyle]}>
                                {item.details || item.name || "Item"}
                            </Text>
                        </View>
                        <View style={[styles.col3]}>
                            <Text style={[tableCellStyle, styles.tableCellCenter]}>
                                {item.hsn || ""}
                            </Text>
                        </View>
                        <View style={[styles.col4]}>
                            <Text style={[tableCellStyle, styles.tableCellCenter]}>
                                {qty}
                            </Text>
                        </View>
                        <View style={[styles.col5]}>
                            <Text style={[tableCellStyle, styles.tableCellRight]}>
                                {formatCurrency(item.rate || 0).replace('₹', '')}
                            </Text>
                        </View>
                        <View style={[styles.col6]}>
                            <Text style={[tableCellStyle, styles.tableCellCenter]}>
                                {item.per || "Nos"}
                            </Text>
                        </View>
                        <View style={[styles.col7]}>
                            <Text style={[tableCellStyle, styles.tableCellRight]}>
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

const MinimalAmountInWords = ({ amount, dynamicStyles }) => (
    <View style={styles.amountWordsSection}>
        <Text style={styles.amountWordsTitle}>Amount in Words:</Text>
        <Text style={styles.amountWordsText}>
            INR {numberToWords(amount)}
        </Text>
    </View>
);

const MinimalFooter = ({ invoice, dynamicStyles }) => (
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

// Main Minimal White Template Component
export const MinimalWhiteTemplate = (invoice) => {
    const totals = calculateTotals(invoice.items || [], invoice);

    // Get dynamic settings from invoice data
    const pageSize = invoice.pageSize || invoice.templateSettings?.pageSize || 'A4';
    const fontSize = invoice.templateSettings?.fontSize || 'normal';

    // Calculate font scale
    const getFontScale = () => {
        switch (fontSize) {
            case 'small': return 0.85;
            case 'large': return 1.15;
            case 'normal':
            default: return 1.0;
        }
    };

    const fontScale = getFontScale();

    // Create dynamic styles
    const dynamicStyles = StyleSheet.create({
        page: {
            ...styles.page,
            fontSize: (styles.page?.fontSize || 8.5) * fontScale,
        },
        headerCompanyName: {
            ...styles.headerCompanyName,
            fontSize: (styles.headerCompanyName?.fontSize || 20) * fontScale,
        },
        taxInvoiceTitle: {
            ...styles.taxInvoiceTitle,
            fontSize: (styles.taxInvoiceTitle?.fontSize || 24) * fontScale,
        },
        companyName: {
            ...styles.companyName,
            fontSize: (styles.companyName?.fontSize || 14) * fontScale,
        },
        sectionTitle: {
            ...styles.sectionTitle,
            fontSize: (styles.sectionTitle?.fontSize || 11) * fontScale,
        },
        tableHeaderCell: {
            ...styles.tableHeaderCell,
            fontSize: (styles.tableHeaderCell?.fontSize || 8) * fontScale,
        },
        tableCell: {
            ...styles.tableCell,
            fontSize: (styles.tableCell?.fontSize || 8) * fontScale,
        }
    });

    return (
        <Document>
            <Page size={pageSize} style={dynamicStyles.page}>
                <MinimalHeader invoice={invoice} dynamicStyles={dynamicStyles} />
                <MinimalInfoSection invoice={invoice} dynamicStyles={dynamicStyles} />
                <MinimalCustomerSection invoice={invoice} dynamicStyles={dynamicStyles} />
                <MinimalItemsTable invoice={invoice} totals={totals} dynamicStyles={dynamicStyles} />
                <MinimalAmountInWords amount={totals.grandTotal} dynamicStyles={dynamicStyles} />
                <MinimalFooter invoice={invoice} dynamicStyles={dynamicStyles} />

                {invoice.customerNotes && (
                    <View style={styles.notesSection}>
                        <Text style={[styles.notesTitle, { fontSize: (styles.notesTitle?.fontSize || 9) * fontScale }]}>Notes:</Text>
                        <Text style={[styles.notesText, { fontSize: (styles.notesText?.fontSize || 8) * fontScale }]}>{invoice.customerNotes}</Text>
                    </View>
                )}

                <Text style={[styles.footer, { fontSize: (styles.footer?.fontSize || 7) * fontScale }]}>
                    This is a Computer Generated Invoice
                </Text>
            </Page>
        </Document>
    );
};

export default MinimalWhiteTemplate;