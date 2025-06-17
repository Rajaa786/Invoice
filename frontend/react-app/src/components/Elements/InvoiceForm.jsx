import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";
import { X, Download, Plus, Camera } from "lucide-react";
import { format, addDays } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { jsPDF } from "jspdf";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Check } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import CustomerForm from "./CustomerForm";
import CompanyForm from "./CompanyForm";
import ItemForm from "./ItemForm";
import generateInvoicePDF from "./generateInvoicePDF";
// import { addDays } from "date-fns";

const InvoiceForm = () => {
  // State for form fields
  const [customerName, setCustomerName] = useState("");
  // const [invoiceNumber, setInvoiceNumber] = useState("INV-000002");
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState("30"); // Default: Due On Receipt
  const [customerNotes, setCustomerNotes] = useState(
    "Thanks for your business."
  );
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  // Add at the top of your component after the useState declarations
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [dbItems, setDbItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [signature, setSignature] = useState(null);
  // const [signatureUploadOpen, setSignatureUploadOpen] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const fileInputRef = useRef(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [companySelectOpen, setCompanySelectOpen] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [itemSelectsOpen, setItemSelectsOpen] = useState({});
  // const [termSelectOpen, setTermSelectOpen] = useState(false);
  // const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [companyInitials, setCompanyInitials] = useState("");
  const [invoiceSequence, setInvoiceSequence] = useState("0001");
  const [companySignature, setCompanySignature] = useState(null);
  const [companyInitialsMap, setCompanyInitialsMap] = useState({});
  // const [paymentTerms, setPaymentTerms] = useState("");
  const [termSelectOpen, setTermSelectOpen] = useState(false);
  const [customTerm, setCustomTerm] = useState(""); // track typed input

  const defaultTerms = ["0", "15", "30", "45", "60", "90"];

  // Change this line
  const [invoiceNumber, setInvoiceNumber] = useState(""); // Remove the default "INV-000002"

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        // Assuming you're using electron's contextBridge to expose this API
        const response = await window.electron.getCompany();
        console.log("API response:", response);

        if (response.success) {
          // Make sure this matches the actual response structure
          const companiesData = response.companies || response.data || [];
          console.log("Companies data:", companiesData);

          // Check if each company has necessary fields
          const validCompanies = companiesData.map((company) => {
            // Log to see what fields are available
            // console.log("Company fields:", Object.keys(company));
            return company;
          });

          setCompanies(validCompanies);
        } else {
          console.error("Failed to fetch companies:", response.error);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoadingItems(true);
      try {
        // Using the electron API from preload.js to get items
        const response = await window.electron.getItem();
        console.log("Items API response:", response);

        if (response.success) {
          // Make sure this matches the actual response structure
          const itemsData = response.items || response.data || [];
          console.log("Items data:", itemsData);

          // Transform the items to match the format needed for the dropdown
          const formattedItems = itemsData.map((item) => ({
            id: item.id,
            name: item.name,
            rate: item.sellingPrice?.toString() || "0.00",
            description: item.description || "",
            unit: item.unit || "",
            hsn: item.hsnSacCode || "", // Add this line to include HSN code
          }));
          console.log("Formatted items:", formattedItems);

          setDbItems(formattedItems);
          // Replace the static itemsList with the database items
          setItemsList(formattedItems);
        } else {
          console.error("Failed to fetch items:", response.error);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchItems();
  }, []);
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        // Using the electron API from preload.js to get customers
        const response = await window.electron.getCustomer();
        console.log("Customers API response:", response);

        if (response.success) {
          // Make sure this matches the actual response structure
          const customersData = response.customers || response.data || [];
          console.log("Customers data:", customersData);

          setCustomers(customersData);
        } else {
          console.error("Failed to fetch customers:", response.error);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);
  // Add this with your other useEffects
  useEffect(() => {
    if (companyInitials) {
      setInvoiceNumber(`${companyInitials}-${invoiceSequence}`);
    }
  }, [companyInitials, invoiceSequence]);

  // Load company initials from local storage on component mount
  useEffect(() => {
    const savedInitials = localStorage.getItem("companyInitialsMap");
    if (savedInitials) {
      try {
        setCompanyInitialsMap(JSON.parse(savedInitials));
      } catch (e) {
        console.error("Error loading saved company initials", e);
      }
    }
  }, []);

  // Save company initials to local storage when they change
  useEffect(() => {
    if (Object.keys(companyInitialsMap).length > 0) {
      localStorage.setItem(
        "companyInitialsMap",
        JSON.stringify(companyInitialsMap)
      );
    }
  }, [companyInitialsMap]);
  useEffect(() => {
    // Fetch all invoices to find the latest invoice number
    const fetchLatestInvoiceNumber = async () => {
      try {
        const response = await window.electron.getAllInvoices();

        if (
          response.success &&
          response.invoices &&
          response.invoices.length > 0
        ) {
          // Sort invoices by ID in descending order to get the latest one
          const sortedInvoices = [...response.invoices].sort(
            (a, b) => b.id - a.id
          );
          const latestInvoice = sortedInvoices[0];

          console.log("Latest invoice:", latestInvoice);

          if (latestInvoice && latestInvoice.invoiceNo) {
            // Extract the sequence number part from the latest invoice number
            const parts = latestInvoice.invoiceNo.split("-");
            if (parts.length === 2) {
              const latestInitials = parts[0];
              const latestSequence = parts[1];

              // Increment the sequence number
              const sequenceNumber = parseInt(latestSequence, 10);
              if (!isNaN(sequenceNumber)) {
                const newSequence = (sequenceNumber + 1)
                  .toString()
                  .padStart(4, "0");
                setInvoiceSequence(newSequence);

                // If company is already selected, update the full invoice number
                if (companyInitials) {
                  setInvoiceNumber(`${companyInitials}-${newSequence}`);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching latest invoice number:", error);
      }
    };

    fetchLatestInvoiceNumber();
  }, [companyInitials]);

  useEffect(() => {
    // Only run this when a company is selected
    if (selectedCompany && selectedCompany.id) {
      // Fetch company-specific latest invoice
      fetchCompanyLatestInvoice(selectedCompany.id, companyInitials);
    }
  }, [selectedCompany]); // This should run when selectedCompany changes

  // Add companyInitials as dependency to update when company changes
  // State for invoice items
  const [items, setItems] = useState([
    {
      id: 1,
      details: "",
      quantity: "1.00",
      rate: "0.00",
      amount: "0.00",
      hsn: "", // Add this line
    },
  ]);

  const [itemsList, setItemsList] = useState();

  // State for calculations
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Customers data
  const [customers, setCustomers] = useState([
    { id: "customer1", name: "Customer 1" },
    { id: "customer2", name: "Customer 2" },
  ]);

  // State for download dialog
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [savedInvoice, setSavedInvoice] = useState(null);

  // Effect to calculate amounts when items change
  useEffect(() => {
    calculateTotals();
  }, [items]);

  // Calculate due date based on selected payment terms
  useEffect(() => {
    if (invoiceDate && paymentTerms) {
      const days = parseInt(paymentTerms, 10);
      const newDueDate = addDays(new Date(invoiceDate), days);
      setDueDate(newDueDate);
    }
  }, [invoiceDate, paymentTerms]);

  // Handle payment terms change
  const handleTermsChange = (value) => {
    setPaymentTerms(value);
  };

  // Add this cleanup useEffect
  useEffect(() => {
    // This will clean up the blob URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []);

  // Modify your existing useEffect for better cleanup
  useEffect(() => {
    // Cleanup function to revoke the URL when it changes
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Calculate item amount when quantity or rate changes
  const updateItemAmount = (id, quantity, rate) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const parsedQuantity = parseFloat(quantity) || 0;
        const parsedRate = parseFloat(rate) || 0;
        const amount = (parsedQuantity * parsedRate).toFixed(2);
        return { ...item, quantity, rate, amount };
      }
      return item;
    });

    setItems(updatedItems);
  };

  // Calculate totals (subtotal, taxes, total)
  const calculateTotals = () => {
    const calculatedSubtotal = items.reduce((sum, item) => {
      return sum + parseFloat(item.amount || 0);
    }, 0);

    setSubtotal(calculatedSubtotal);
    setTotal(calculatedSubtotal); // Add taxes here if needed
  };

  // Add a new row to the items table
  const addNewRow = () => {
    const newId =
      items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
    setItems([
      ...items,
      {
        id: newId,
        details: "",
        quantity: "1.00",
        rate: "0.00",
        amount: "0.00",
      },
    ]);
  };

  // Remove a row from the items table
  const removeRow = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignature(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeSignature = () => {
    setSignature(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  // Handle saving new customer
  const handleSaveCustomer = (customerData) => {
    console.log("New customer data:", customerData);
  };
  // Add after your other handler functions
  const handleCompanySelect = (companyId) => {
    console.log("Selecting company with ID:", companyId);

    // Find the company
    const company = companies.find(
      (company) => String(company.id) === String(companyId)
    );

    if (company) {
      setSelectedCompany(company);

      // Check if we already have custom initials for this company
      let initials;
      if (companyInitialsMap[company.id]) {
        initials = companyInitialsMap[company.id];
      } else {
        // Generate default initials
        initials = generateCompanyInitials(company.companyName);
        // Store the generated initials
        setCompanyInitialsMap((prev) => ({ ...prev, [company.id]: initials }));
      }

      setCompanyInitials(initials);

      // Get company-specific latest invoice number
      fetchCompanyLatestInvoice(company.id, initials);

      // Other company-related updates...
    }
  };
  const fetchCompanyLatestInvoice = async (companyId, initials) => {
    try {
      const response = await window.electron.getAllInvoices();

      if (
        response.success &&
        response.invoices &&
        response.invoices.length > 0
      ) {
        // Filter invoices for this specific company and sort by ID
        const companyInvoices = response.invoices
          .filter((invoice) => invoice.companyId === companyId)
          .sort((a, b) => b.id - a.id);

        if (companyInvoices.length > 0) {
          const latestInvoice = companyInvoices[0];

          if (latestInvoice && latestInvoice.invoiceNo) {
            // Extract the sequence number part from the latest invoice number
            const parts = latestInvoice.invoiceNo.split("-");
            if (parts.length === 2) {
              const latestSequence = parts[1];
              const sequenceNumber = parseInt(latestSequence, 10);

              if (!isNaN(sequenceNumber)) {
                const newSequence = (sequenceNumber + 1)
                  .toString()
                  .padStart(4, "0");
                setInvoiceSequence(newSequence);
                setInvoiceNumber(`${initials}-${newSequence}`);
                return;
              }
            }
          }
        }

        // If no invoices found for this company or invalid format, start from 0001
        setInvoiceSequence("0001");
        setInvoiceNumber(`${initials}-0001`);
      }
    } catch (error) {
      console.error("Error fetching company invoices:", error);
      // Default to 0001 if there's an error
      setInvoiceSequence("0001");
      setInvoiceNumber(`${initials}-0001`);
    }
  };

  // Add function to update company initials
  const updateCompanyInitials = (newInitials) => {
    if (selectedCompany) {
      // Update the map
      setCompanyInitialsMap((prev) => ({
        ...prev,
        [selectedCompany.id]: newInitials,
      }));
      // Update current initials
      setCompanyInitials(newInitials);
      // Update invoice number
      setInvoiceNumber(`${newInitials}-${invoiceSequence}`);
    }
  };
  const handleSequenceChange = (value) => {
    setInvoiceSequence(value);
    setInvoiceNumber(`${companyInitials}-${value}`);
  };
  // Create a new function to find existing items
  const findExistingItem = (items, itemId) => {
    return items.findIndex(
      (item) =>
        item.details ===
        dbItems.find((dbItem) => dbItem.id === parseInt(itemId))?.name
    );
  };

  // Modify the handleItemSelect function to check for duplicates
  const handleItemSelect = (rowId, itemId) => {
    console.log("Selecting item with ID:", itemId, "for row:", rowId);

    // Find the selected item from database
    const selectedItem = dbItems.find((item) => item.id === parseInt(itemId));
    console.log("Found item:", selectedItem);

    if (!selectedItem) return;

    // Check if this item already exists in our items list
    const existingItemIndex = findExistingItem(items, itemId);

    if (
      existingItemIndex !== -1 &&
      existingItemIndex !== items.findIndex((item) => item.id === rowId)
    ) {
      // Item already exists, update its quantity instead of adding a new row
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];

      // Calculate new quantity (add 1 to existing quantity)
      const currentQuantity = parseFloat(existingItem.quantity) || 0;
      const newQuantity = currentQuantity + 1;

      // Update the quantity and recalculate amount
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity.toString(),
        amount: (newQuantity * parseFloat(existingItem.rate || 0)).toFixed(2),
      };

      // If this was a new empty row, we should remove it
      if (items.length > 1 && !items.find((i) => i.id === rowId).details) {
        const filteredItems = updatedItems.filter((item) => item.id !== rowId);
        setItems(filteredItems);
      } else {
        // Otherwise just update the quantities
        setItems(updatedItems);
      }

      // Show a notification or feedback that quantity was updated
      console.log(`Updated quantity for existing item: ${selectedItem.name}`);

      // Close this specific item's dropdown
      setItemSelectsOpen((prev) => ({
        ...prev,
        [rowId]: false,
      }));

      return;
    }

    // Item doesn't exist yet, add it normally
    const updatedItems = items.map((item) => {
      if (item.id === rowId) {
        // Add debugging to verify HSN value
        console.log("HSN from selected item:", selectedItem.hsn);
        return {
          ...item,
          details: selectedItem.name,
          rate: selectedItem.rate || "0.00",
          hsn: selectedItem.hsn || "",
          amount: (
            (parseFloat(item.quantity) || 1) *
            (parseFloat(selectedItem.rate) || 0)
          ).toFixed(2),
        };
      }
      return item;
    });

    console.log("Updated items:", updatedItems);
    setItems(updatedItems);

    // Close this specific item's dropdown
    setItemSelectsOpen((prev) => ({
      ...prev,
      [rowId]: false,
    }));
  };
  const handleCustomerSelect = (customerId) => {
    console.log("Selecting customer with ID:", customerId);

    // Find the customer
    const customer = customers.find(
      (customer) => String(customer.id) === String(customerId)
    );

    if (customer) {
      setSelectedCustomer(customer);

      // Create a full name from firstName and lastName, or use the name field if available
      const fullName =
        customer.firstName || customer.lastName
          ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
          : customer.name || "";

      setCustomerName(fullName);

      // You can set additional customer details here if needed
      // For example, you might want to populate address fields, etc.
    }
  };
  const handleSaveItem = (newItem) => {
    // You would typically add the new item to your items array here
    console.log("New item saved:", newItem);
    // You might want to implement additional logic to add the item to the list
  };
  // Handle form submission
  const handleSubmit = async (isDraft = false) => {
    // Step 1: Validate essential input data
    if (!selectedCompany) {
      alert("Please select a company before saving the invoice");
      return;
    }

    if (!selectedCustomer) {
      alert("Please select a customer before saving the invoice");
      return;
    }

    try {
      // Step 2: Calculate tax amounts and total
      const calculatedCgst = subtotal * 0.09;
      const calculatedSgst = subtotal * 0.09;
      const calculatedTotal = subtotal + calculatedCgst + calculatedSgst;

      console.log("items max", items);
      console.log("iiitem", itemsList);
      // Step 3: Prepare invoice data for database
      const invoiceForDB = {
        companyId: selectedCompany.id,
        customerId: selectedCustomer.id,
        invoiceNumber: invoiceNumber,
        invoiceDate: invoiceDate,
        dueDate: dueDate,
        paymentTerms: paymentTerms,
        incomeLedger: document.getElementById("incomeLedger").value,
        items: items.map((item) => ({
          id: item.id,
          details: item.details || "",
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0,
        })),
        subtotal: subtotal,
        cgstRate: 9,
        sgstRate: 9,
        cgstAmount: calculatedCgst,
        sgstAmount: calculatedSgst,
        totalAmount: calculatedTotal,
        customerNotes: customerNotes,
        termsAndConditions: termsAndConditions,
        status: isDraft ? "draft" : "sent",
        // Pass the signature data string if available
        signature: signature || null,
      };

      console.log("Saving invoice:", invoiceForDB);

      // Step 4: Save invoice to database
      const result = await window.electron.addInvoice(invoiceForDB);

      if (!result.success) {
        throw new Error(result.error);
      }
      const currentSequence = parseInt(invoiceSequence, 10);
      const nextSequence = (currentSequence + 1).toString().padStart(4, "0");
      setInvoiceSequence(nextSequence);
      // Step 5: Set the saved invoice with the database ID included
      setSavedInvoice({ ...invoiceForDB, id: result.data.id });

      // Step 6: Prepare properly formatted data for PDF generation
      const invoiceForPDF = {
        invoiceNumber: invoiceNumber || "SI-0001599",
        invoiceDate: invoiceDate,
        dueDate: dueDate,
        customerNotes: customerNotes,
        termsAndConditions: termsAndConditions,
        cgstRate: 9,
        sgstRate: 9,
        cgstAmount: calculatedCgst,
        sgstAmount: calculatedSgst,
        totalAmount: calculatedTotal,

        // Step 7: Format company data with correct property names
        company: {
          companyName:
            selectedCompany.companyName ||
            selectedCompany.name ||
            "Company Name",
          addressLine1: selectedCompany.addressLine1 || "",
          addressLine2: selectedCompany.addressLine2 || "",
          city: selectedCompany.city || "",
          state: selectedCompany.state || "",
          email: selectedCompany.email || "",
          contactNo: selectedCompany.contactNo || "",
          gstin: selectedCompany.gstin || "",
          stateCode: selectedCompany.stateCode || "",
          // Use the base64 encoded logo directly from selectedCompany if available
          logo: selectedCompany.logo || null,
        },

        // Step 8: Format customer data with correct property names
        customer: {
          name:
            selectedCustomer.firstName && selectedCustomer.lastName
              ? `${selectedCustomer.salutation || ""} ${selectedCustomer.firstName
                } ${selectedCustomer.lastName}`.trim()
              : selectedCustomer.companyName || "Customer Name",
          addressLine1: selectedCustomer.billingAddressLine1 || "",
          addressLine2: selectedCustomer.billingAddressLine2 || "",
          city: selectedCustomer.billingCity || "",
          state: selectedCustomer.billingState || "",
          country: selectedCustomer.billingCountry || "",
          email: selectedCustomer.billingEmail || "",
          contactNo: selectedCustomer.billingContactNo || "",
          gstin: selectedCustomer.gstin || "",
          stateCode: selectedCustomer.stateCode || "",
        },

        // Step 9: Include signature for PDF generation
        // Use provided signature or company signature from DB
        signature: signature || selectedCompany.signature || null,

        // Step 10: Format items for PDF generation
        items: items.map((item) => ({
          name: item.details || "Item",
          details: item.details || "",
          hsn: item.hsn || "",
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          per: item.per || "Nos",
          amount: parseFloat(item.amount) || 0,
        })),
      };

      console.log("PDF invoice data:", invoiceForPDF);

      const doc = generateInvoicePDF(invoiceForPDF);

      const pdfBlob = doc.output("blob");
      // Set the MIME type explicitly for the blob
      const pdfBlobWithType = new Blob([pdfBlob], { type: "application/pdf" });

      // Revoke any existing URL to avoid memory leaks
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      const url = URL.createObjectURL(pdfBlobWithType);
      setPdfUrl(url);

      // Step 13: Show download dialog but don't show preview yet
      setShowDownloadDialog(true);
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(`There was an error saving the invoice: ${error.message}`);
    }
  };
  // Handle download
  const handleDownload = () => {
    if (pdfUrl && savedInvoice) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Invoice-${savedInvoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Don't automatically show preview after download
      // The user can click "Quick View" if they want to see it
    }
  };

  const resetForm = () => {
    // Reset form fields but keep company initials map
    setItems([
      {
        id: 1,
        details: "",
        quantity: "1.00",
        rate: "0.00",
        amount: "0.00",
        hsn: "",
      },
    ]);
    setCustomerName("");
    setSelectedCustomer(null);
    setInvoiceDate(new Date());
    setDueDate(new Date());
    setCustomerNotes("Thanks for your business.");
    setTermsAndConditions("");
    setSignature(null);
    // Don't reset company initials as they should persist
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    console.log("Form reset and cancelled");
  };

  // Add a close handler for the download dialog
  const handleCloseDownloadDialog = () => {
    setShowDownloadDialog(false);
    resetForm();
    console.log("Invoice saved and form reset");
  };

  // Add this after your useState declarations
  const generateCompanyInitials = (companyName) => {
    if (!companyName) return "";

    // Split the company name by spaces and take first letter of each word
    return companyName
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("")
      .substring(0, 6); // Changed from 3 to 6 to allow up to 6 characters
  };
  const formatPaymentTerms = (value) => {
    return value ? `Net ${value}` : "Select or enter terms";
  };

  return (
    <div className="rounded-xl mt-2 space-y-6">
      <Card className="w-full shadow-sm border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle>New Invoice</CardTitle>
          <CardDescription>
            Fill in the details to create a new invoice
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-6">
              {/* Company Name and Customer Name */}
              <div className="flex items-start gap-4">
                <Label htmlFor="companyName" className="w-32 pt-2">
                  Company Name
                </Label>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {/* Add logo display here */}
                    {selectedCompany && selectedCompany.logo && (
                      <div className="h-10 w-10 flex-shrink-0 rounded-md border overflow-hidden">
                        <img
                          src={selectedCompany.logo}
                          alt={`${selectedCompany.companyName} logo`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                    <Select
                      open={companySelectOpen}
                      onOpenChange={setCompanySelectOpen}
                      onValueChange={(value) => {
                        handleCompanySelect(value);
                        setCompanySelectOpen(false);
                      }}
                      className="flex-1"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            selectedCompany
                              ? selectedCompany.companyName
                              : isLoadingCompanies
                                ? "Loading companies..."
                                : "Select company"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="p-0">
                        <Command className="rounded-md border-none bg-background">
                          <div className="p-2 border-b flex gap-2">
                            <div className="relative flex-1">
                              <CommandInput
                                placeholder="Search customers..."
                                className="h-10"
                              />
                            </div>
                            <Button
                              size="sm"
                              className="h-10"
                              onClick={() => setCompanyFormOpen(true)}
                            >
                              <Plus className="h-4 w-4" /> Add
                            </Button>
                          </div>
                          <CommandEmpty>
                            <div className="p-4 max-w-[600px] text-center text-muted-foreground">
                              <p className="text-md">
                                No matching customers found
                              </p>
                              <p className="text-sm mt-1">
                                Click the{" "}
                                <Plus className="h-3 w-3 inline-block mx-1" />{" "}
                                icon above to add a new customer
                              </p>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {companies.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={String(company.id)}
                                onSelect={(value) => {
                                  handleCompanySelect(value);
                                  setCompanySelectOpen(false);
                                }}
                                className="flex items-center"
                              >
                                {/* Add logo in dropdown list */}
                                {company.logo && (
                                  <div className="h-6 w-6 mr-2 rounded overflow-hidden flex-shrink-0">
                                    <img
                                      src={company.logo}
                                      alt={`${company.companyName} logo`}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  {company.companyName}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Render the CompanyForm dialog */}
                <CompanyForm
                  open={companyFormOpen}
                  onOpenChange={setCompanyFormOpen}
                  onSave={(newCompany) => {
                    console.log("New customer saved:", newCompany);
                    // Additional logic to add the customer to your list
                  }}
                />

                <Label htmlFor="customerName" className="w-30 pt-2 ml-6">
                  Customer Name
                </Label>
                <div className="flex-1">
                  {/* Customer Name Dropdown */}
                  <Select
                    open={customerSelectOpen}
                    onOpenChange={setCustomerSelectOpen}
                    onValueChange={(value) => {
                      handleCustomerSelect(value);
                      setCustomerSelectOpen(false);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          selectedCustomer
                            ? `${selectedCustomer.firstName || ""} ${selectedCustomer.lastName || ""
                              }`.trim()
                            : "Select or add customer"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      <Command className="rounded-md border-none bg-background">
                        <div className="p-2 border-b flex gap-2">
                          <div className="relative flex-1">
                            <CommandInput
                              placeholder="Search customers..."
                              className="h-10"
                            />
                          </div>
                          <Button
                            size="sm"
                            className="h-10"
                            onClick={() => setCustomerFormOpen(true)}
                          >
                            <Plus className="h-4 w-4" /> Add
                          </Button>
                        </div>
                        <CommandEmpty>
                          <div className="p-4 max-w-[600px] text-center text-muted-foreground">
                            <p className="text-md">
                              No matching customers found
                            </p>
                            <p className="text-sm mt-1">
                              Click the{" "}
                              <Plus className="h-3 w-3 inline-block mx-1" />{" "}
                              icon above to add a new customer
                            </p>
                          </div>
                        </CommandEmpty>
                        <div className="max-h-[200px] overflow-y-auto">
                          <CommandGroup>
                            {isLoadingCustomers ? (
                              <CommandItem disabled>
                                Loading customers...
                              </CommandItem>
                            ) : customers.length === 0 ? (
                              <CommandItem disabled>
                                No customers found
                              </CommandItem>
                            ) : (
                              customers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={String(customer.id)}
                                  onSelect={(value) => {
                                    handleCustomerSelect(value);
                                    setCustomerSelectOpen(false);
                                  }}
                                  className="flex items-center"
                                >
                                  <div className="flex-1">
                                    {/* Display combined first name and last name */}
                                    {`${customer.firstName || ""} ${customer.lastName || ""
                                      }`.trim() ||
                                      customer.name ||
                                      "Unnamed Customer"}
                                  </div>
                                </CommandItem>
                              ))
                            )}
                          </CommandGroup>
                        </div>
                      </Command>
                    </SelectContent>
                  </Select>
                </div>
                {/* Render the CustomerForm dialog */}
                <CustomerForm
                  open={customerFormOpen}
                  onOpenChange={setCustomerFormOpen}
                  onSave={(newCustomer) => {
                    console.log("New customer saved:", newCustomer);
                    // Additional logic to add the customer to your list
                  }}
                />
              </div>

              {/* Invoice Number */}
              {/* Invoice Number */}
              <div className="flex items-start gap-4">
                <Label htmlFor="invoiceNumber" className="w-32 pt-2">
                  Invoice No.
                </Label>
                <div className="flex-1 relative flex">
                  {/* Company Initials (editable part) */}
                  <div className="flex-shrink-0 border border-r-0 rounded-l-md flex items-center">
                    <Input
                      className="w-20 rounded-r-none border-r-0 text-center" // Widened from w-16 to w-20
                      value={companyInitials}
                      onChange={(e) =>
                        updateCompanyInitials(
                          e.target.value.toUpperCase().slice(0, 6) // Changed from 3 to 6
                        )
                      }
                      maxLength={6} // Changed from 3 to 6
                    />
                  </div>
                  {/* Separator */}
                  <div className="flex-shrink-0 bg-gray-100 border border-x-0 flex items-center px-1">
                    <span className="text-gray-700">-</span>
                  </div>
                  {/* Sequence Number (editable part) */}
                  <Input
                    id="invoiceSequence"
                    value={invoiceSequence}
                    onChange={(e) => handleSequenceChange(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>

                <Label htmlFor="incomeLedger" className="w-28 pt-2 ml-6">
                  Ledger
                </Label>
                <div className="flex-1 relative">
                  <Input id="incomeLedger" />
                </div>
              </div>

              {/* Invoice Date and Terms */}
              <div className="flex items-start gap-4">
                <Label htmlFor="invoiceDate" className="w-32 pt-2">
                  Invoice Date
                </Label>
                <div className="flex-1 relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        id="invoiceDate"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 justify-between items-center"
                      >
                        {invoiceDate instanceof Date && !isNaN(invoiceDate)
                          ? format(invoiceDate, "dd/MM/yyyy")
                          : "DD/MM/YYYY"}

                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={invoiceDate}
                        onSelect={setInvoiceDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items  -center">
                  <Label htmlFor="terms" className="w-28 pt-2 ml-6">
                    Expected Due
                  </Label>
                  <div className="flex  relative w-36">
                    <Select
                      value={paymentTerms}
                      onValueChange={(value) => {
                        setPaymentTerms(value);
                        if (invoiceDate) {
                          const newDueDate = addDays(
                            new Date(invoiceDate),
                            parseInt(value)
                          );
                          setDueDate(newDueDate);
                        }
                      }}
                      open={termSelectOpen}
                      onOpenChange={setTermSelectOpen}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder="payment terms"
                          defaultValue=""
                          children={
                            paymentTerms ? `Net ${paymentTerms}` : undefined
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {/* Custom term (if any) */}
                        {customTerm && !defaultTerms.includes(customTerm) && (
                          <SelectItem value={customTerm}>
                            Net {customTerm} (Custom)
                          </SelectItem>
                        )}

                        {/* Search / Input Field */}
                        <div className="p-2 border-b">
                          <input
                            type="number"
                            placeholder="Enter custom days..."
                            className="h-10 w-full px-2 border rounded"
                            value={customTerm}
                            onChange={(e) => setCustomTerm(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const days = parseInt(e.currentTarget.value);
                                if (!isNaN(days)) {
                                  setPaymentTerms(days.toString());
                                  if (invoiceDate) {
                                    const newDueDate = addDays(
                                      new Date(invoiceDate),
                                      days
                                    );
                                    setDueDate(newDueDate);
                                  }
                                  setCustomTerm(""); // clear input after enter
                                  setTermSelectOpen(false);
                                }
                              }
                            }}
                          />
                        </div>

                        {/* Default Terms */}
                        <div className="max-h-[200px] overflow-y-auto">
                          {defaultTerms.map((term) => (
                            <SelectItem key={term} value={term}>
                              Net {term}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Label htmlFor="dueDate" className="w-28 pt-2 ml-6">
                  Due Date
                </Label>
                <div className="flex-1 relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        id="dueDate"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 justify-between items-center"
                      >
                        {dueDate instanceof Date && !isNaN(dueDate)
                          ? format(dueDate, "dd/MM/yyyy")
                          : "DD/MM/YYYY"}

                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Item Table */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-lg">Item Table</h3>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[40%]">ITEM DETAILS</TableHead>
                      <TableHead className="text-center">
                        HSN/SAC
                      </TableHead>{" "}
                      {/* New column */}
                      <TableHead className="text-center">QUANTITY</TableHead>
                      <TableHead className="text-center">RATE</TableHead>
                      <TableHead className="text-center">AMOUNT</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="w-full">
                            <Select
                              open={itemSelectsOpen[item.id] || false}
                              onOpenChange={(open) => {
                                setItemSelectsOpen((prev) => ({
                                  ...prev,
                                  [item.id]: open,
                                }));
                              }}
                              onValueChange={(value) => {
                                handleItemSelect(item.id, value);
                                setItemSelectsOpen((prev) => ({
                                  ...prev,
                                  [item.id]: false,
                                }));
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={
                                    isLoadingItems
                                      ? "Loading items..."
                                      : item.details || "Select or add item"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent className="p-0">
                                <Command className="rounded-md border-none bg-background">
                                  <div className="p-2 border-b flex gap-2">
                                    <div className="relative flex-1">
                                      <CommandInput
                                        placeholder="Search items..."
                                        className="h-10"
                                      />
                                    </div>
                                    <Button
                                      size="sm"
                                      className="px-2 h-10"
                                      onClick={() => setItemFormOpen(true)}
                                    >
                                      <Plus className="h-4 w-4" /> Add
                                    </Button>
                                  </div>
                                  <CommandEmpty>
                                    <div className="p-4 max-w-[600px] text-center text-muted-foreground">
                                      <p className="text-md">
                                        No matching items found
                                      </p>
                                      <p className="text-sm mt-1">
                                        Click the{" "}
                                        <Plus className="h-3 w-3 inline-block mx-1" />{" "}
                                        icon above to add a new item
                                      </p>
                                    </div>
                                  </CommandEmpty>
                                  <div className="max-h-[200px] overflow-y-auto">
                                    <CommandGroup>
                                      {dbItems.map((dbItem) => (
                                        <CommandItem
                                          key={dbItem.id}
                                          value={String(dbItem.id)}
                                          onSelect={(value) => {
                                            handleItemSelect(item.id, value);
                                            // Close the popover
                                            document.body.click();
                                          }}
                                          className="flex items-center justify-between"
                                        >
                                          <div className="flex-1">
                                            {dbItem.name}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            ₹{dbItem.rate}
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </div>
                                </Command>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <ItemForm
                          open={itemFormOpen}
                          onOpenChange={setItemFormOpen}
                          onSave={handleSaveItem}
                        />
                        <TableCell className="text-center">
                          <Input
                            value={item.hsn || ""}
                            className="text-center"
                            onChange={(e) => {
                              const updatedItems = items.map((i) => {
                                if (i.id === item.id) {
                                  return { ...i, hsn: e.target.value };
                                }
                                return i;
                              });
                              setItems(updatedItems);
                            }}
                            placeholder="HSN/SAC"
                          />
                        </TableCell>

                        <TableCell className="text-center">
                          <Input
                            value={item.quantity}
                            className="text-center"
                            onChange={(e) => {
                              updateItemAmount(
                                item.id,
                                e.target.value,
                                item.rate
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            value={item.rate}
                            className="text-center"
                            onChange={(e) => {
                              updateItemAmount(
                                item.id,
                                item.quantity,
                                e.target.value
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            value={item.amount}
                            className="text-center"
                            readOnly
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeRow(item.id)}
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex gap-4 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-50 border-gray-200 text-blue-500 flex items-center gap-1"
                    onClick={addNewRow}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Row</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-50 border-gray-200 text-blue-500 flex items-center gap-1"
                    onClick={() => {
                      // Add multiple empty rows
                      const newRows = Array.from({ length: 5 }, (_, index) => ({
                        id: items.length + index + 1,
                        details: "",
                        quantity: "1.00",
                        rate: "0.00",
                        amount: "0.00",
                      }));
                      setItems([...items, ...newRows]);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Items in Bulk</span>
                  </Button>
                </div>

                {/* Total Section with GST */}
                <div className="flex justify-between items-center mt-6 border-t pt-4">
                  <div></div>
                  <div className="w-1/3">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-black">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    {/* CGST */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-black">CGST (9%)</span>
                      <span>₹{(subtotal * 0.09).toFixed(2)}</span>
                    </div>

                    {/* SGST */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-black">SGST (9%)</span>
                      <span>₹{(subtotal * 0.09).toFixed(2)}</span>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center mb-2 border-t pt-2">
                      <span className="text-black font-bold">Total ( ₹ )</span>
                      <span className="font-medium">
                        ₹{(subtotal + subtotal * 0.18).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/*  Customer Notes */}
              <div className="mt-6">
                <Label htmlFor="customerNotes" className="block mb-2">
                  Narration
                </Label>
                <Textarea
                  id="customerNotes"
                  placeholder="Thanks for your business."
                  className="max-w-[500px]"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />
                <p className="text-gray-500 text-xs mt-1">
                  Will be displayed on the invoice
                </p>
              </div>

              {/* Terms and Conditions */}
              {showTerms && (
                <div className="mt-6">
                  <Label htmlFor="termsAndConditions" className="block mb-2">
                    Terms and Conditions
                  </Label>
                  <Textarea
                    id="termsAndConditions"
                    placeholder="Enter your terms and conditions here."
                    className="max-w-[500px]"
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                  />
                </div>
              )}

              {/* Additional Options */}
              <div className="space-y-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-50 border-gray-200 text-blue-500 flex items-center gap-1"
                  onClick={() => setShowTerms(!showTerms)}
                >
                  <Plus className="h-4 w-4" />
                  <span>{showTerms ? "Hide" : "Add"} Terms and conditions</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex gap-2 border-t pt-4 justify-end">
          <Button onClick={() => handleSubmit(true)}>Save</Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </CardFooter>

        {/* Download Invoice Dialog */}
        <AlertDialog
          open={showDownloadDialog}
          onOpenChange={(open) => {
            if (!open) resetForm(); // Reset form when closing dialog
            setShowDownloadDialog(open);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Invoice Saved Successfully</AlertDialogTitle>
              <AlertDialogDescription>
                Your invoice has been saved. Would you like to download a PDF
                copy?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <Button
                variant="outline"
                onClick={() => {
                  // Ensure PDF URL exists before showing preview
                  if (pdfUrl) {
                    setShowPdfPreview(true); // This should now work after removing the line from handleSubmit
                  } else {
                    alert("PDF preview is not ready yet. Please try again.");
                  }
                }}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Quick View
              </Button>
              <AlertDialogAction
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Invoice
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
      <AlertDialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <AlertDialogHeader className="p-4 border-b">
            <div className="flex justify-between items-center w-full">
              <AlertDialogTitle>Invoice Preview</AlertDialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPdfPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDialogHeader>
          <div className="flex-1 min-h-[70vh] bg-gray-100 overflow-auto">
            {pdfUrl ? (
              <embed
                src={pdfUrl}
                type="application/pdf"
                className="w-full h-full border-0"
                title="Invoice Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Loading preview...</p>
              </div>
            )}
          </div>
          <AlertDialogFooter className="p-4 border-t">
            <AlertDialogCancel onClick={() => setShowPdfPreview(false)}>
              Close
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvoiceForm;
