import React, { useEffect, useState } from "react";
import InvoiceForm from "../Elements/InvoiceForm";
import InvoiceTable from "./InvoiceTable";
import { Loader2, AlertTriangle, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { calculateGSTAmounts, getCustomerStateCode } from "../../shared/constants/GSTConfig";

// Status configuration for invoices
const INVOICE_STATUS = {
  OVERDUE: {
    label: "Overdue",
    color: "destructive",
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-800",
    icon: AlertTriangle,
    priority: 1
  },
  DUE_SOON: {
    label: "Due Soon",
    color: "warning",
    bgColor: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-800",
    icon: Clock,
    priority: 2
  },
  PENDING: {
    label: "Pending",
    color: "secondary",
    bgColor: "bg-blue-50 border-blue-200",
    textColor: "text-blue-800",
    icon: AlertCircle,
    priority: 3
  },
  PAID: {
    label: "Paid",
    color: "success",
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-800",
    icon: CheckCircle,
    priority: 4
  },
};

export default function GenerateReport() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusStats, setStatusStats] = useState({
    overdue: 0,
    dueSoon: 0,
    pending: 0,
    paid: 0,
    totalAmount: 0,
    overdueAmount: 0
  });

  // Calculate invoice status based on days until due
  const calculateStatus = (daysUntilDue, isPaid = false) => {
    if (isPaid) return 'PAID';
    if (daysUntilDue < 0) return 'OVERDUE';
    if (daysUntilDue <= 7) return 'DUE_SOON';
    return 'PENDING';
  };

  // Format currency in Indian Rupee format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Status badge component
  const StatusBadge = ({ status, daysUntilDue }) => {
    const statusConfig = INVOICE_STATUS[status];
    const Icon = statusConfig.icon;

    return (
      <div className="flex items-center gap-2">
        <Badge variant={statusConfig.color} className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {statusConfig.label}
        </Badge>
        <span className={`text-xs font-medium ${daysUntilDue < 0 ? 'text-red-600' :
          daysUntilDue <= 7 ? 'text-yellow-600' :
            'text-gray-600'
          }`}>
          {daysUntilDue < 0
            ? `${Math.abs(daysUntilDue)} days overdue`
            : daysUntilDue === 0
              ? 'Due today'
              : `${daysUntilDue} days left`
          }
        </span>
      </div>
    );
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      console.group('📊 [Invoice] Fetching and processing invoices');
      setLoading(true);
      try {
        const response = await window.electron.getAllInvoices();
        console.log('📥 [Invoice] Received invoices response:', {
          success: response.success,
          count: response.invoices?.length
        });

        if (response.success) {
          const invoiceList = response.invoices;

          const processedInvoices = await Promise.all(
            invoiceList.map(async (invoice) => {
              console.group(`📄 [Invoice] Processing invoice: ${invoice.invoiceNo}`);
              let customerName = "Unknown Customer";
              let customerDetails = null;

              // Try to get customer details
              if (invoice.customerId) {
                try {
                  const customerResponse = await window.electron.getCustomerById(invoice.customerId);
                  console.log('👤 [Invoice] Customer lookup result:', {
                    success: customerResponse.success,
                    customerId: invoice.customerId
                  });

                  if (customerResponse.success && customerResponse.customer) {
                    // Construct customer name from firstName and lastName
                    customerName = customerResponse.customer.firstName && customerResponse.customer.lastName
                      ? `${customerResponse.customer.firstName} ${customerResponse.customer.lastName}`
                      : customerResponse.customxer.companyName || "Unknown Customer";

                    customerDetails = customerResponse.customer;
                    console.log('✅ [Invoice] Customer details found:', {
                      name: customerName,
                      state: customerDetails.state,
                      gstin: customerDetails.gstin,
                      gstApplicable: customerDetails.gstApplicable,
                      stateCode: customerDetails.stateCode
                    });
                  } else {
                    console.warn('⚠️ [Invoice] Customer not found:', invoice.customerId);
                  }
                } catch (error) {
                  console.error('❌ [Invoice] Error fetching customer:', {
                    customerId: invoice.customerId,
                    error: error.message
                  });
                }
              } else {
                console.warn('⚠️ [Invoice] No customerId in invoice:', invoice.invoiceNo);
              }

              // Get customer's state code for GST calculation
              const customerStateCode = getCustomerStateCode(customerDetails);

              // Use the totalAmount from the invoice record
              const amount = parseFloat(invoice.totalAmount) || 0;
              const subtotal = parseFloat(invoice.subtotal) || 0;
              const gstDetails = {
                cgstAmount: parseFloat(invoice.cgstAmount) || 0,
                sgstAmount: parseFloat(invoice.sgstAmount) || 0,
                totalGST: (parseFloat(invoice.cgstAmount) || 0) + (parseFloat(invoice.sgstAmount) || 0),
                cgstRate: parseFloat(invoice.cgstRate) || 0,
                sgstRate: parseFloat(invoice.sgstRate) || 0,
                isIntraState: customerStateCode === "27"
              };

              console.log('💰 [Invoice] Amount details:', {
                invoiceNo: invoice.invoiceNo,
                totalAmount: amount?.toFixed(2),
                subtotal: subtotal?.toFixed(2),
                cgstAmount: invoice.cgstAmount?.toFixed(2),
                sgstAmount: invoice.sgstAmount?.toFixed(2)
              });

              const dueDateObj = new Date(invoice.dueDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              dueDateObj.setHours(0, 0, 0, 0);

              const diffTime = dueDateObj - today;
              const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              const status = calculateStatus(daysUntilDue, invoice.status === 'paid');
              const statusConfig = INVOICE_STATUS[status];

              console.log('📅 [Invoice] Due date calculation:', {
                invoiceNo: invoice.invoiceNo,
                dueDate: invoice.dueDate,
                daysUntilDue,
                status,
                isPaid: invoice.status === 'paid'
              });

              const processedInvoice = {
                ...invoice,
                invoiceNo: invoice.invoiceNo,
                invoiceDate: formatDate(invoice.invoiceDate),
                dueDate: formatDate(invoice.dueDate),
                amount: amount,
                subtotal: subtotal,
                formattedAmount: formatCurrency(amount),
                customerName,
                customerStateCode,
                ...gstDetails,
                daysUntilDue,
                status,
                statusConfig,
                rowClassName: statusConfig.bgColor,
                priority: statusConfig.priority
              };

              console.log('✅ [Invoice] Processed invoice:', {
                invoiceNo: processedInvoice.invoiceNo,
                amount: processedInvoice.formattedAmount,
                status: processedInvoice.status,
                gstType: processedInvoice.isIntraState ? 'CGST+SGST' : 'IGST',
                totalGST: gstDetails.totalGST?.toFixed(2)
              });

              console.groupEnd();
              return processedInvoice;
            })
          );

          // Sort by priority (overdue first, then by days until due)
          processedInvoices.sort((a, b) => {
            if (a.priority !== b.priority) {
              return a.priority - b.priority;
            }
            return a.daysUntilDue - b.daysUntilDue;
          });

          // Calculate statistics
          const stats = processedInvoices.reduce((acc, invoice) => {
            acc.totalAmount += invoice.amount;

            switch (invoice.status) {
              case 'OVERDUE':
                acc.overdue++;
                acc.overdueAmount += invoice.amount;
                break;
              case 'DUE_SOON':
                acc.dueSoon++;
                break;
              case 'PENDING':
                acc.pending++;
                break;
              case 'PAID':
                acc.paid++;
                break;
            }
            return acc;
          }, { overdue: 0, dueSoon: 0, pending: 0, paid: 0, totalAmount: 0, overdueAmount: 0 });

          console.log('📊 [Invoice] Final statistics:', {
            totalInvoices: processedInvoices.length,
            overdue: stats.overdue,
            dueSoon: stats.dueSoon,
            pending: stats.pending,
            paid: stats.paid,
            totalAmount: formatCurrency(stats.totalAmount),
            overdueAmount: formatCurrency(stats.overdueAmount)
          });

          setStatusStats(stats);
          setInvoices(processedInvoices);
        } else {
          console.error('❌ [Invoice] Failed to fetch invoices:', response.error);
        }
      } catch (error) {
        console.error('❌ [Invoice] Error processing invoices:', {
          error: error.message,
          stack: error.stack
        });
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="p-8 pt-4 space-y-6 bg-white dark:bg-black">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Invoice Generator</h2>

        {/* Status Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{statusStats.overdue}</div>
              <p className="text-xs text-red-600">{formatCurrency(statusStats.overdueAmount)}</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Due Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{statusStats.dueSoon}</div>
              <p className="text-xs text-yellow-600">Within 7 days</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{statusStats.pending}</div>
              <p className="text-xs text-blue-600">Not due yet</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{statusStats.paid}</div>
              <p className="text-xs text-green-600">Completed</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <InvoiceForm />
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center items-center h-40 space-x-2 text-primary">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading invoices...</span>
          </div>
        ) : (
          <InvoiceTable data={invoices} loading={loading} />
        )}
      </div>
    </div>
  );
}
