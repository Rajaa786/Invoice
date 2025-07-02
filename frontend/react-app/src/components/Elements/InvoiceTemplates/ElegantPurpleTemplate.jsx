import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Elegant Purple Template - Sophisticated and premium design
const colors = {
    primary: '#7c3aed',      // Violet-600
    secondary: '#8b5cf6',    // Violet-500
    accent: '#a855f7',       // Purple-500
    text: '#1f2937',         // Gray-800
    textSecondary: '#6b7280', // Gray-500
    border: '#e5e7eb',       // Gray-200
    background: '#faf5ff',   // Purple-50
    white: '#ffffff',
    success: '#6366f1',      // Indigo-500
    light: '#f3e8ff'         // Purple-100
};

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: colors.text,
        backgroundColor: colors.white,
        padding: 20,
    },

    // Elegant header with sophisticated styling and logo support
    header: {
        marginBottom: 30,
        padding: 25,
        backgroundColor: colors.white,
        borderRadius: 6,
        position: 'relative',
        borderBottom: `2pt solid ${colors.primary}`,
        borderLeft: `4pt solid ${colors.accent}`,
    },

    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    headerLeft: {
        flex: 1,
        alignItems: 'center',
    },

    headerCenter: {
        flex: 2,
        alignItems: 'center',
    },

    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
    },

    logoContainer: {
        width: 120,
        height: 60,
        marginBottom: 5,
    },

    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 2,
        marginBottom: 5,
        textAlign: 'center',
    },

    taxInvoiceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 5,
        textAlign: 'center',
    },

    headerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        letterSpacing: 1,
    },

    invoiceNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
        backgroundColor: colors.accent,
        padding: 8,
        borderRadius: 4,
    },

    // Sophisticated layout sections
    mainSection: {
        flexDirection: 'row',
        gap: 25,
        marginBottom: 30,
    },

    leftColumn: {
        flex: 2,
    },

    rightColumn: {
        flex: 1,
    },

    sectionCard: {
        backgroundColor: colors.white,
        border: `1pt solid ${colors.border}`,
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
    },

    sectionHeader: {
        backgroundColor: colors.light,
        padding: 12,
        borderBottom: `1pt solid ${colors.border}`,
    },

    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    sectionContent: {
        padding: 16,
    },

    // Company information styling
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
    },

    addressLine: {
        fontSize: 10,
        color: colors.textSecondary,
        lineHeight: 1.6,
        marginBottom: 3,
    },

    gstinBadge: {
        backgroundColor: colors.light,
        color: colors.primary,
        padding: 6,
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        border: `1pt solid ${colors.primary}`,
    },

    // Invoice details with elegant styling
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottom: `0.5pt solid ${colors.border}`,
    },

    detailLabel: {
        fontSize: 10,
        color: colors.textSecondary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    detailValue: {
        fontSize: 11,
        color: colors.text,
        fontWeight: 'bold',
    },

    // Customer information
    customerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
    },

    customerAddress: {
        fontSize: 10,
        color: colors.textSecondary,
        lineHeight: 1.5,
        marginBottom: 3,
    },

    // Elegant table design
    tableContainer: {
        marginBottom: 30,
        backgroundColor: colors.white,
        borderRadius: 8,
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
        letterSpacing: 0.5,
    },

    tableRow: {
        flexDirection: 'row',
        padding: 12,
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
        paddingHorizontal: 5,
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

    // Elegant tax and total styling
    summarySection: {
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 8,
        border: `1pt solid ${colors.border}`,
        marginBottom: 25,
    },

    taxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: `0.5pt dotted ${colors.border}`,
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

    totalDivider: {
        height: 1,
        backgroundColor: colors.primary,
        marginVertical: 12,
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 6,
        marginTop: 10,
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

    // Amount in words with elegant styling
    amountWordsSection: {
        backgroundColor: colors.light,
        padding: 20,
        marginBottom: 25,
        borderRadius: 8,
        border: `1pt solid ${colors.primary}`,
    },

    amountWordsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    amountWordsText: {
        fontSize: 12,
        color: colors.text,
        fontWeight: 'bold',
        fontStyle: 'italic',
        lineHeight: 1.4,
    },

    // Elegant footer design
    footerSection: {
        flexDirection: 'row',
        gap: 25,
        marginBottom: 25,
    },

    declarationSection: {
        flex: 2,
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 8,
        border: `1pt solid ${colors.border}`,
    },

    signatureSection: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 8,
        border: `2pt solid ${colors.primary}`,
        alignItems: 'center',
    },

    declarationTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    declarationText: {
        fontSize: 10,
        color: colors.textSecondary,
        lineHeight: 1.6,
        textAlign: 'justify',
    },

    signatureArea: {
        minHeight: 60,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        border: `1pt dashed ${colors.primary}`,
        borderRadius: 4,
        width: '100%',
        backgroundColor: colors.background,
    },

    signatureText: {
        fontSize: 10,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
        fontStyle: 'italic',
    },

    authorizedSignatory: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    // Elegant footer
    pageFooter: {
        textAlign: 'center',
        fontSize: 9,
        color: colors.textSecondary,
        paddingTop: 20,
        borderTop: `1pt solid ${colors.border}`,
        fontStyle: 'italic',
        backgroundColor: colors.background,
        padding: 15,
        borderRadius: 4,
    },

    // Notes section
    notesSection: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: colors.light,
        borderRadius: 8,
        border: `1pt solid ${colors.primary}`,
    },

    notesTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    notesText: {
        fontSize: 10,
        color: colors.text,
        lineHeight: 1.5,
    },
});

// Helper functions (shared across templates)
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

// Elegant Purple Template Components
const ElegantHeader = ({ invoice, dynamicStyles }) => (
    <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerContent}>
            <View style={dynamicStyles.headerLeft}>
                <View style={{ width: 120, height: 'auto', marginBottom: 8 }}>
                    <Image
                        src={invoice.company?.logo || "/cyphersol-logo.png"}
                    />
                </View>
            </View>

            <View style={dynamicStyles.headerRight}>
                <Text style={dynamicStyles.taxInvoiceTitle}>TAX INVOICE</Text>
                <Text style={dynamicStyles.invoiceNumber}>
                    {invoice.invoiceNumber || "INV-001"}
                </Text>
            </View>
        </View>
    </View>
);

const ElegantMainSection = ({ invoice, dynamicStyles }) => (
    <View style={dynamicStyles.mainSection}>
        <View style={dynamicStyles.leftColumn}>
            {/* Company Information */}
            <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                    <Text style={dynamicStyles.sectionTitle}>Bill From</Text>
                </View>
                <View style={dynamicStyles.sectionContent}>
                    <Text style={dynamicStyles.companyName}>
                        {invoice.company?.companyName || "Company Name"}
                    </Text>
                    {invoice.company?.addressLine1 && (
                        <Text style={dynamicStyles.addressLine}>{invoice.company.addressLine1}</Text>
                    )}
                    {invoice.company?.city && (
                        <Text style={dynamicStyles.addressLine}>{invoice.company.city}</Text>
                    )}
                    {invoice.company?.gstin && (
                        <Text style={dynamicStyles.gstinBadge}>GSTIN: {invoice.company.gstin}</Text>
                    )}
                </View>
            </View>

            {/* Customer Information */}
            <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                    <Text style={dynamicStyles.sectionTitle}>Bill To</Text>
                </View>
                <View style={dynamicStyles.sectionContent}>
                    <Text style={dynamicStyles.customerName}>
                        {invoice.customer?.name || invoice.customerName || "Customer Name"}
                    </Text>
                    {invoice.customer?.addressLine1 && (
                        <Text style={dynamicStyles.customerAddress}>{invoice.customer.addressLine1}</Text>
                    )}
                </View>
            </View>
        </View>

        <View style={dynamicStyles.rightColumn}>
            {/* Invoice Details */}
            <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                    <Text style={dynamicStyles.sectionTitle}>Invoice Details</Text>
                </View>
                <View style={dynamicStyles.sectionContent}>
                    <View style={dynamicStyles.detailRow}>
                        <Text style={dynamicStyles.detailLabel}>Invoice No</Text>
                        <Text style={dynamicStyles.detailValue}>{invoice.invoiceNumber || "INV-001"}</Text>
                    </View>
                    <View style={dynamicStyles.detailRow}>
                        <Text style={dynamicStyles.detailLabel}>Date</Text>
                        <Text style={dynamicStyles.detailValue}>{formatDate(invoice.invoiceDate)}</Text>
                    </View>
                    <View style={dynamicStyles.detailRow}>
                        <Text style={dynamicStyles.detailLabel}>Due Date</Text>
                        <Text style={dynamicStyles.detailValue}>{formatDate(invoice.dueDate)}</Text>
                    </View>
                    <View style={dynamicStyles.detailRow}>
                        <Text style={dynamicStyles.detailLabel}>Terms</Text>
                        <Text style={dynamicStyles.detailValue}>30 Days</Text>
                    </View>
                </View>
            </View>
        </View>
    </View>
);

const ElegantItemsTable = ({ invoice, totals, dynamicStyles }) => {
    const items = invoice.items || [];

    return (
        <View>
            <View style={dynamicStyles.tableContainer}>
                <View style={dynamicStyles.tableHeader}>
                    <Text style={[dynamicStyles.tableHeaderCell, dynamicStyles.col1]}>Sl.</Text>
                    <Text style={[dynamicStyles.tableHeaderCell, dynamicStyles.col2]}>Description</Text>
                    <Text style={[dynamicStyles.tableHeaderCell, dynamicStyles.col3]}>HSN/SAC</Text>
                    <Text style={[dynamicStyles.tableHeaderCell, dynamicStyles.col4]}>Qty</Text>
                    <Text style={[dynamicStyles.tableHeaderCell, dynamicStyles.col5]}>Rate</Text>
                    <Text style={[dynamicStyles.tableHeaderCell, dynamicStyles.col6]}>Unit</Text>
                    <Text style={[dynamicStyles.tableHeaderCell, dynamicStyles.col7]}>Amount</Text>
                </View>

                {items.map((item, index) => {
                    const qty = parseFloat(item.quantity) || 1;
                    const isEven = index % 2 === 0;

                    return (
                        <View key={index} style={[dynamicStyles.tableRow, !isEven && dynamicStyles.tableRowAlt]}>
                            <View style={[dynamicStyles.col1]}>
                                <Text style={[dynamicStyles.tableCell, dynamicStyles.tableCellCenter]}>
                                    {index + 1}
                                </Text>
                            </View>
                            <View style={[dynamicStyles.col2]}>
                                <Text style={[dynamicStyles.tableCell]}>
                                    {item.details || item.name || "Item"}
                                </Text>
                            </View>
                            <View style={[dynamicStyles.col3]}>
                                <Text style={[dynamicStyles.tableCell, dynamicStyles.tableCellCenter]}>
                                    {item.hsn || ""}
                                </Text>
                            </View>
                            <View style={[dynamicStyles.col4]}>
                                <Text style={[dynamicStyles.tableCell, dynamicStyles.tableCellCenter]}>
                                    {qty}
                                </Text>
                            </View>
                            <View style={[dynamicStyles.col5]}>
                                <Text style={[dynamicStyles.tableCell, dynamicStyles.tableCellRight]}>
                                    {formatCurrency(item.rate || 0).replace('₹', '')}
                                </Text>
                            </View>
                            <View style={[dynamicStyles.col6]}>
                                <Text style={[dynamicStyles.tableCell, dynamicStyles.tableCellCenter]}>
                                    {item.per || "Nos"}
                                </Text>
                            </View>
                            <View style={[dynamicStyles.col7]}>
                                <Text style={[dynamicStyles.tableCell, dynamicStyles.tableCellRight]}>
                                    {formatCurrency(item.amount || (qty * (item.rate || 0))).replace('₹', '')}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Summary Section */}
            <View style={dynamicStyles.summarySection}>
                <View style={dynamicStyles.taxRow}>
                    <Text style={dynamicStyles.taxLabel}>Subtotal</Text>
                    <Text style={dynamicStyles.taxAmount}>{formatCurrency(totals.subtotal)}</Text>
                </View>
                <View style={dynamicStyles.taxRow}>
                    <Text style={dynamicStyles.taxLabel}>CGST ({totals.cgstRate}%)</Text>
                    <Text style={dynamicStyles.taxAmount}>{formatCurrency(totals.cgstAmount)}</Text>
                </View>
                <View style={dynamicStyles.taxRow}>
                    <Text style={dynamicStyles.taxLabel}>SGST ({totals.sgstRate}%)</Text>
                    <Text style={dynamicStyles.taxAmount}>{formatCurrency(totals.sgstAmount)}</Text>
                </View>
                <View style={dynamicStyles.totalDivider} />
                <View style={dynamicStyles.totalRow}>
                    <Text style={dynamicStyles.totalLabel}>Grand Total</Text>
                    <Text style={dynamicStyles.totalAmount}>{formatCurrency(totals.grandTotal)}</Text>
                </View>
            </View>
        </View>
    );
};

const ElegantAmountInWords = ({ amount, dynamicStyles }) => (
    <View style={dynamicStyles.amountWordsSection}>
        <Text style={dynamicStyles.amountWordsTitle}>Amount in Words:</Text>
        <Text style={dynamicStyles.amountWordsText}>
            INR {numberToWords(amount)}
        </Text>
    </View>
);

const ElegantFooter = ({ invoice, dynamicStyles }) => (
    <View style={dynamicStyles.footerSection}>
        <View style={dynamicStyles.declarationSection}>
            <Text style={dynamicStyles.declarationTitle}>Declaration</Text>
            <Text style={dynamicStyles.declarationText}>
                We declare that this invoice shows the actual price of the goods described
                and that all particulars are true and correct. This document is electronically
                generated and constitutes a valid tax invoice under applicable regulations.
            </Text>
        </View>

        <View style={dynamicStyles.signatureSection}>
            <View style={dynamicStyles.signatureArea}>
                {invoice.signature && (
                    <Image
                        src={invoice.signature}
                        style={{ width: 80, height: 40 }}
                    />
                )}
            </View>
            <Text style={dynamicStyles.signatureText}>
                for {invoice.company?.companyName || "Company Name"}
            </Text>
            <Text style={dynamicStyles.authorizedSignatory}>Authorized Signatory</Text>
        </View>
    </View>
);

// Main Elegant Purple Template Component
export const ElegantPurpleTemplate = (invoice) => {
    // Add debug logging
    console.log('🔍 ElegantPurpleTemplate - Invoice Data:', {
        fullInvoice: invoice,
        company: invoice?.company,
        logo: invoice?.company?.logo,
        companyName: invoice?.company?.companyName
    });

    const totals = calculateTotals(invoice.items || [], invoice);

    // Get dynamic settings from invoice data
    const pageSize = invoice.pageSize || invoice.templateSettings?.pageSize || 'A4';
    const fontSize = invoice.templateSettings?.fontSize || 'normal';

    // Calculate font scale based on fontSize setting
    const getFontScale = () => {
        switch (fontSize) {
            case 'small': return 0.85;
            case 'large': return 1.15;
            case 'normal':
            default: return 1.0;
        }
    };

    const fontScale = getFontScale();

    // Create dynamic styles based on settings
    let dynamicStyles;
    try {
        dynamicStyles = StyleSheet.create({
            page: {
                ...styles.page,
                fontSize: (styles.page?.fontSize || 10) * fontScale,
            },
            headerTitle: {
                ...styles.headerTitle,
                fontSize: (styles.headerTitle?.fontSize || 26) * fontScale,
            },
            taxInvoiceTitle: {
                ...styles.taxInvoiceTitle,
                fontSize: (styles.taxInvoiceTitle?.fontSize || 18) * fontScale,
            },
            companyName: {
                ...styles.companyName,
                fontSize: (styles.companyName?.fontSize || 20) * fontScale,
            },
            sectionTitle: {
                ...styles.sectionTitle,
                fontSize: (styles.sectionTitle?.fontSize || 11) * fontScale,
            }
        });
    } catch (error) {
        console.warn('⚠️ [ElegantPurpleTemplate] Failed to create dynamic styles, using fallback:', error);
        dynamicStyles = styles;
    }

    console.log(`🎨 [ElegantPurpleTemplate] Rendering with settings:`, {
        pageSize,
        fontSize,
        fontScale,
        hasTemplateSettings: !!invoice.templateSettings,
        companyName: invoice.company?.companyName,
        hasLogo: !!invoice.company?.logo,
        logoPath: invoice.company?.logo,
        itemCount: invoice.items?.length,
        hasDynamicStyles: !!dynamicStyles,
        invoiceStructure: {
            hasInvoiceNumber: !!invoice.invoiceNumber,
            hasCompany: !!invoice.company,
            hasCustomer: !!invoice.customer,
            hasItems: !!invoice.items,
            totalsCalculated: !!totals
        }
    });

    try {
        return (
            <Document>
                <Page size={pageSize} style={dynamicStyles.page}>
                    <ElegantHeader invoice={invoice} dynamicStyles={dynamicStyles} />
                    <ElegantMainSection invoice={invoice} dynamicStyles={dynamicStyles} />
                    <ElegantItemsTable invoice={invoice} totals={totals} dynamicStyles={dynamicStyles} />
                    <ElegantAmountInWords amount={totals.grandTotal} dynamicStyles={dynamicStyles} />
                    <ElegantFooter invoice={invoice} dynamicStyles={dynamicStyles} />

                    {invoice.customerNotes && (
                        <View style={dynamicStyles.notesSection}>
                            <Text style={[dynamicStyles.notesTitle, { fontSize: (dynamicStyles.notesTitle?.fontSize || 10) * fontScale }]}>
                                Notes:
                            </Text>
                            <Text style={[dynamicStyles.notesText, { fontSize: (dynamicStyles.notesText?.fontSize || 9) * fontScale }]}>
                                {invoice.customerNotes}
                            </Text>
                        </View>
                    )}

                    <Text style={[dynamicStyles.pageFooter, { fontSize: (dynamicStyles.pageFooter?.fontSize || 8) * fontScale }]}>
                        This is a Computer Generated Invoice
                    </Text>
                </Page>
            </Document>
        );
    } catch (error) {
        console.error('❌ [ElegantPurpleTemplate] Failed to create PDF document:', error);

        // Return a simple fallback document
        return (
            <Document>
                <Page size="A4" style={{ padding: 30, fontFamily: 'Helvetica' }}>
                    <View style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Text style={{ fontSize: 24, color: colors.primary, marginBottom: 10 }}>Template Error</Text>
                        <Text style={{ fontSize: 12 }}>Unable to render the full template.</Text>
                        <Text style={{ fontSize: 10, marginTop: 10 }}>
                            Error: {error.message || 'Unknown PDF rendering error'}
                        </Text>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 12, marginBottom: 5 }}>Invoice: {invoice.invoiceNumber}</Text>
                        <Text style={{ fontSize: 12, marginBottom: 5 }}>Company: {invoice.company?.companyName}</Text>
                        <Text style={{ fontSize: 12, marginBottom: 5 }}>Customer: {invoice.customer?.name}</Text>
                        <Text style={{ fontSize: 12 }}>Total: ₹{totals.grandTotal?.toLocaleString('en-IN')}</Text>
                    </View>
                </Page>
            </Document>
        );
    }
};

export default ElegantPurpleTemplate;