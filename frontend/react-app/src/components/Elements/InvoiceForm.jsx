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
import { X, Download, Plus, Camera, FileText, User, Building, Calendar as CalendarIcon, DollarSign, Settings, ArrowRight, Info } from "lucide-react";
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
import { pdf } from "@react-pdf/renderer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Badge } from "../ui/badge";
import CustomerForm from "./CustomerForm";
import CompanyForm from "./CompanyForm";
import ItemForm from "./ItemForm";
import { generateInvoicePDF } from "./generateInvoicePDF";
import { templateLogger } from "../../utils/templateLogger";
import { useCompanyConfiguration } from "../../hooks/useConfiguration";

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

  // New configuration hooks
  const { getCompanyInitials, setCompanyInitials: saveCompanyInitials } = useCompanyConfiguration();

  // Change this line
  const [invoiceNumber, setInvoiceNumber] = useState(""); // Remove the default "INV-000002"

  // Additional schema fields
  const [status, setStatus] = useState("draft");
  const [priority, setPriority] = useState("normal");
  const [tags, setTags] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [branchId, setBranchId] = useState("");
  const [territory, setTerritory] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [currentTab, setCurrentTab] = useState("basic");
  const [completedTabs, setCompletedTabs] = useState(new Set());
  const [incomeLedger, setIncomeLedger] = useState("Sales");

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
  const handleCompanySelect = async (companyId) => {
    console.log("Selecting company with ID:", companyId);

    // Find the company
    const company = companies.find(
      (company) => String(company.id) === String(companyId)
    );

    if (company) {
      setSelectedCompany(company);

      // Check if we already have custom initials for this company
      let initials;

      // Try to get from new configuration system first
      const savedInitials = await getCompanyInitials(company.id);
      if (savedInitials) {
        initials = savedInitials;
      } else if (companyInitialsMap[company.id]) {
        // Fallback to old system
        initials = companyInitialsMap[company.id];
        // Migrate to new system
        await saveCompanyInitials(company.id, initials);
      } else {
        // Generate default initials
        initials = generateCompanyInitials(company.companyName);
        // Store in both systems
        setCompanyInitialsMap((prev) => ({ ...prev, [company.id]: initials }));
        await saveCompanyInitials(company.id, initials);
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
  const updateCompanyInitials = async (newInitials) => {
    if (selectedCompany) {
      // Save to new configuration system
      await saveCompanyInitials(selectedCompany.id, newInitials);

      // Update the map (for backward compatibility)
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
      const shouldApplyGST = selectedCustomer.gstApplicable === 'Yes';
      const calculatedCgst = shouldApplyGST ? subtotal * 0.09 : 0;
      const calculatedSgst = shouldApplyGST ? subtotal * 0.09 : 0;
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
        incomeLedger: incomeLedger,
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
        discountAmount: discountAmount,
        discountPercentage: discountPercentage,
        customerNotes: customerNotes,
        termsAndConditions: termsAndConditions,
        status: isDraft ? "draft" : "pending",
        priority: priority,
        tags: tags,
        internalNotes: internalNotes,
        currency: currency,
        exchangeRate: exchangeRate,
        paymentMethod: paymentMethod,
        paymentReference: paymentReference,
        branchId: branchId,
        territory: territory,
        createdBy: createdBy,
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
          gstApplicable: selectedCustomer.gstApplicable || "No",
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

      templateLogger.invoiceForm('PDF data prepared', {
        invoiceNumber: invoiceForPDF.invoiceNumber,
        companyName: invoiceForPDF.company?.companyName,
        customerName: invoiceForPDF.customer?.name,
        itemCount: invoiceForPDF.items?.length
      });

      // Generate PDF using react-pdf (now async)
      templateLogger.invoiceForm('Starting PDF generation');
      const pdfDocument = await generateInvoicePDF(invoiceForPDF);

      templateLogger.invoiceForm('Creating PDF blob');
      const pdfBlob = await pdf(pdfDocument).toBlob();

      templateLogger.success('InvoiceForm', 'PDF blob created successfully', {
        blobSize: pdfBlob.size,
        invoiceNumber: invoiceForPDF.invoiceNumber
      });

      // Revoke any existing URL to avoid memory leaks
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      const url = URL.createObjectURL(pdfBlob);
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
    setIncomeLedger("Sales");
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

  // Check if tabs are completed
  const isTabCompleted = (tabName) => {
    switch (tabName) {
      case "basic":
        return selectedCompany && selectedCustomer && invoiceNumber;
      case "items":
        return items.some(item => item.details && parseFloat(item.amount) > 0);
      case "terms":
        return customerNotes.trim().length > 0;
      case "additional":
        return true; // Optional tab
      default:
        return false;
    }
  };

  // Update completed tabs when data changes
  useEffect(() => {
    const newCompletedTabs = new Set();
    ["basic", "items", "terms", "additional"].forEach(tab => {
      if (isTabCompleted(tab)) {
        newCompletedTabs.add(tab);
      }
    });
    setCompletedTabs(newCompletedTabs);
  }, [selectedCompany, selectedCustomer, invoiceNumber, items, customerNotes]);

  // Get next recommended tab
  const getNextTab = () => {
    if (!isTabCompleted("basic")) return "basic";
    if (!isTabCompleted("items")) return "items";
    if (!isTabCompleted("terms")) return "terms";
    return "additional";
  };

  // Check if form is ready to submit
  const isFormReadyToSubmit = () => {
    return isTabCompleted("basic") && isTabCompleted("items");
  };

  return (
    <div className="max-w-7xl mx-auto p-3 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-xs text-gray-600 mt-1">Create and manage your invoice details</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs px-3 py-1">
            {invoiceNumber || "Draft"}
          </Badge>
          {getNextTab() !== "additional" && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              Next: {getNextTab() === "basic" ? "Complete Basic Details" :
                getNextTab() === "items" ? "Add Items" :
                  "Add Notes"}
            </Badge>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} size="sm">
              Cancel
            </Button>
            {!isFormReadyToSubmit() ? (
              <Button
                variant="outline"
                onClick={() => setCurrentTab(getNextTab())}
                size="sm"
                className="flex items-center gap-1 text-xs px-3 py-1 h-7"
              >
                {getNextTab() === "basic" ? "Complete Basic Details" :
                  getNextTab() === "items" ? "Add Items" : "Continue"}
                <ArrowRight className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSubmit(false)}
                size="sm"
                className="flex items-center gap-1 text-xs px-3 py-1 h-7 bg-green-600 hover:bg-green-700"
              >
                Save Invoice
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Welcome Guide - Show when form is empty */}
      {!selectedCompany && !selectedCustomer && currentTab === "basic" && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-blue-900 mb-2">Welcome to Invoice Creation!</h3>
              <p className="text-sm text-blue-700 mb-3">
                Let's create your invoice step by step. We'll guide you through each section to ensure nothing is missed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                  <span>Select Company & Customer</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                  <span>Add Invoice Items</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                  <span>Add Notes (Optional)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                  <span>Save & Download</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <div className="space-y-4 mb-6">
          {/* Progress Indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-blue-900">Invoice Creation Progress</h3>
              <span className="text-xs text-blue-600">
                {completedTabs.size}/4 sections completed
              </span>
            </div>
            <div className="flex space-x-2">
              {["basic", "items", "terms", "additional"].map((tab, index) => (
                <div key={tab} className="flex-1">
                  <div className={`h-2 rounded-full ${completedTabs.has(tab)
                    ? 'bg-green-500'
                    : currentTab === tab
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                    }`} />
                </div>
              ))}
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="text-sm relative">
              <div className="flex items-center">
                {completedTabs.has("basic") ? (
                  <div className="w-4 h-4 mr-2 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <Building className="w-4 h-4 mr-2" />
                )}
                <span>Basic Details</span>
                {!completedTabs.has("basic") && currentTab !== "basic" && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger value="items" className="text-sm relative">
              <div className="flex items-center">
                {completedTabs.has("items") ? (
                  <div className="w-4 h-4 mr-2 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <DollarSign className="w-4 h-4 mr-2" />
                )}
                <span>Items & Pricing</span>
                {!completedTabs.has("items") && currentTab !== "items" && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger value="terms" className="text-sm relative">
              <div className="flex items-center">
                {completedTabs.has("terms") ? (
                  <div className="w-4 h-4 mr-2 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                <span>Terms & Notes</span>
              </div>
            </TabsTrigger>

            <TabsTrigger value="additional" className="text-sm relative">
              <div className="flex items-center">
                {completedTabs.has("additional") ? (
                  <div className="w-4 h-4 mr-2 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <Settings className="w-4 h-4 mr-2" />
                )}
                <span>Additional Info</span>
                <span className="ml-2 text-xs text-gray-500">(Optional)</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Basic Details Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Selection Card */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-semibold">Company Information</h3>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Company *</Label>
                  <div className="flex items-center gap-3">
                    {selectedCompany && selectedCompany.logo && (
                      <div className="h-10 w-10 rounded-lg border overflow-hidden flex-shrink-0">
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
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue
                          placeholder={
                            selectedCompany
                              ? selectedCompany.companyName
                              : isLoadingCompanies
                                ? "Loading companies..."
                                : "Select your company"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="p-0">
                        <Command>
                          <div className="p-3 border-b flex gap-2">
                            <CommandInput placeholder="Search companies..." className="flex-1" />
                            <Button
                              size="sm"
                              onClick={() => setCompanyFormOpen(true)}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add New
                            </Button>
                          </div>
                          <CommandEmpty>
                            <div className="p-4 text-center text-muted-foreground">
                              <p>No companies found</p>
                              <p className="text-xs mt-1">Click "Add New" to create one</p>
                            </div>
                          </CommandEmpty>
                          <CommandGroup className="max-h-48 overflow-y-auto">
                            {companies.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={String(company.id)}
                                onSelect={(value) => {
                                  handleCompanySelect(value);
                                  setCompanySelectOpen(false);
                                }}
                                className="flex items-center gap-3 p-3"
                              >
                                {company.logo && (
                                  <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0">
                                    <img
                                      src={company.logo}
                                      alt={`${company.companyName} logo`}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                )}
                                <span>{company.companyName}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Customer Selection Card */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  <h3 className="text-base font-semibold">Customer Information</h3>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Customer *</Label>
                  <Select
                    open={customerSelectOpen}
                    onOpenChange={setCustomerSelectOpen}
                    onValueChange={(value) => {
                      handleCustomerSelect(value);
                      setCustomerSelectOpen(false);
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue
                        placeholder={
                          selectedCustomer
                            ? `${selectedCustomer.firstName || ""} ${selectedCustomer.lastName || ""}`.trim()
                            : "Select your customer"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      <Command>
                        <div className="p-3 border-b flex gap-2">
                          <CommandInput placeholder="Search customers..." className="flex-1" />
                          <Button
                            size="sm"
                            onClick={() => setCustomerFormOpen(true)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add New
                          </Button>
                        </div>
                        <CommandEmpty>
                          <div className="p-4 text-center text-muted-foreground">
                            <p>No customers found</p>
                            <p className="text-xs mt-1">Click "Add New" to create one</p>
                          </div>
                        </CommandEmpty>
                        <CommandGroup className="max-h-48 overflow-y-auto">
                          {isLoadingCustomers ? (
                            <CommandItem disabled>Loading customers...</CommandItem>
                          ) : customers.length === 0 ? (
                            <CommandItem disabled>No customers found</CommandItem>
                          ) : (
                            customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={String(customer.id)}
                                onSelect={(value) => {
                                  handleCustomerSelect(value);
                                  setCustomerSelectOpen(false);
                                }}
                                className="p-3"
                              >
                                {`${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
                                  customer.name ||
                                  "Unnamed Customer"}
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </Command>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* Invoice Details Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-semibold">Invoice Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Invoice Number</Label>
                  <div className="flex gap-1">
                    <Input
                      value={companyInitials}
                      onChange={(e) =>
                        updateCompanyInitials(e.target.value.toUpperCase().slice(0, 6))
                      }
                      className="w-20 text-center"
                      maxLength={6}
                      placeholder="ABC"
                    />
                    <div className="flex items-center px-2 bg-gray-100 border rounded">-</div>
                    <Input
                      value={invoiceSequence}
                      onChange={(e) => handleSequenceChange(e.target.value)}
                      className="flex-1"
                      placeholder="0001"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Income Ledger</Label>
                  <Input
                    id="incomeLedger"
                    placeholder="Sales"
                    value={incomeLedger}
                    onChange={(e) => setIncomeLedger(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Invoice Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        {invoiceDate instanceof Date && !isNaN(invoiceDate)
                          ? format(invoiceDate, "dd/MM/yyyy")
                          : "Select date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
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

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        {dueDate instanceof Date && !isNaN(dueDate)
                          ? format(dueDate, "dd/MM/yyyy")
                          : "Select date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Terms</Label>
                  <Select
                    value={paymentTerms}
                    onValueChange={(value) => {
                      setPaymentTerms(value);
                      if (invoiceDate) {
                        const newDueDate = addDays(new Date(invoiceDate), parseInt(value));
                        setDueDate(newDueDate);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b">
                        <input
                          type="number"
                          placeholder="Enter custom days..."
                          className="w-full px-2 py-1 border rounded text-sm"
                          value={customTerm}
                          onChange={(e) => setCustomTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const days = parseInt(e.currentTarget.value);
                              if (!isNaN(days)) {
                                setPaymentTerms(days.toString());
                                if (invoiceDate) {
                                  const newDueDate = addDays(new Date(invoiceDate), days);
                                  setDueDate(newDueDate);
                                }
                                setCustomTerm("");
                              }
                            }
                          }}
                        />
                      </div>
                      {defaultTerms.map((term) => (
                        <SelectItem key={term} value={term}>
                          Net {term} days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation and Guidance for Basic Tab */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {!isTabCompleted("basic") ? (
                  <div className="flex items-center text-amber-600">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    <span className="text-xs font-medium">
                      Please select a company and customer to continue
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <span className="text-xs">✓ Basic details completed! Ready to add invoice items.</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {isTabCompleted("basic") && (
                  <Button
                    onClick={() => setCurrentTab("items")}
                    size="sm"
                    className="flex items-center gap-1 text-xs px-3 py-1 h-7"
                  >
                    Next: Add Items
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Items & Pricing Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-semibold">Invoice Items</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addNewRow}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newRows = Array.from({ length: 5 }, (_, index) => ({
                        id: items.length + index + 1,
                        details: "",
                        quantity: "1.00",
                        rate: "0.00",
                        amount: "0.00",
                        hsn: "",
                      }));
                      setItems([...items, ...newRows]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Bulk Add
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[40%]">Item Details</TableHead>
                      <TableHead className="text-center w-[12%]">HSN/SAC</TableHead>
                      <TableHead className="text-center w-[12%]">Quantity</TableHead>
                      <TableHead className="text-center w-[12%]">Rate (₹)</TableHead>
                      <TableHead className="text-center w-[12%]">Amount (₹)</TableHead>
                      <TableHead className="w-[8%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>
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
                            <SelectTrigger className="w-full h-9">
                              <SelectValue
                                placeholder={
                                  isLoadingItems
                                    ? "Loading..."
                                    : item.details || "Select item"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="p-0">
                              <Command>
                                <div className="p-2 border-b flex gap-2">
                                  <CommandInput placeholder="Search items..." className="flex-1" />
                                  <Button
                                    size="sm"
                                    onClick={() => setItemFormOpen(true)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> Add
                                  </Button>
                                </div>
                                <CommandEmpty>
                                  <div className="p-4 text-center text-muted-foreground">
                                    <p className="text-sm">No items found</p>
                                    <p className="text-xs mt-1">Click "Add" to create one</p>
                                  </div>
                                </CommandEmpty>
                                <CommandGroup className="max-h-48 overflow-y-auto">
                                  {dbItems.map((dbItem) => (
                                    <CommandItem
                                      key={dbItem.id}
                                      value={String(dbItem.id)}
                                      onSelect={(value) => {
                                        handleItemSelect(item.id, value);
                                      }}
                                      className="flex justify-between p-2"
                                    >
                                      <span>{dbItem.name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        ₹{dbItem.rate}
                                      </span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell>
                          <Input
                            value={item.hsn || ""}
                            className="text-center h-9"
                            onChange={(e) => {
                              const updatedItems = items.map((i) => {
                                if (i.id === item.id) {
                                  return { ...i, hsn: e.target.value };
                                }
                                return i;
                              });
                              setItems(updatedItems);
                            }}
                            placeholder="HSN"
                          />
                        </TableCell>

                        <TableCell>
                          <Input
                            value={item.quantity}
                            className="text-center h-9"
                            onChange={(e) => {
                              updateItemAmount(item.id, e.target.value, item.rate);
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Input
                            value={item.rate}
                            className="text-center h-9"
                            onChange={(e) => {
                              updateItemAmount(item.id, item.quantity, e.target.value);
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Input
                            value={item.amount}
                            className="text-center h-9 bg-gray-50"
                            readOnly
                          />
                        </TableCell>

                        <TableCell>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeRow(item.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Discount</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={discountPercentage}
                          onChange={(e) => {
                            const percentage = parseFloat(e.target.value) || 0;
                            setDiscountPercentage(percentage);
                            setDiscountAmount((subtotal * percentage) / 100);
                          }}
                          className="w-20 h-9"
                          placeholder="0"
                        />
                        <span className="text-sm">%</span>
                        <span className="text-sm text-gray-500">or</span>
                        <Input
                          type="number"
                          value={discountAmount}
                          onChange={(e) => {
                            const amount = parseFloat(e.target.value) || 0;
                            setDiscountAmount(amount);
                            setDiscountPercentage(subtotal > 0 ? (amount / subtotal) * 100 : 0);
                          }}
                          className="w-24 h-9"
                          placeholder="0.00"
                        />
                        <span className="text-sm">₹</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-80 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount ({discountPercentage.toFixed(1)}%):</span>
                        <span className="font-medium text-red-600">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxable Amount:</span>
                      <span className="font-medium">₹{(subtotal - discountAmount).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CGST (9%):</span>
                      <span className="font-medium">₹{((subtotal - discountAmount) * 0.09).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">SGST (9%):</span>
                      <span className="font-medium">₹{((subtotal - discountAmount) * 0.09).toFixed(2)}</span>
                    </div>

                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-blue-600">
                          ₹{((subtotal - discountAmount) + ((subtotal - discountAmount) * 0.18)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation and Guidance for Items Tab */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {!isTabCompleted("items") ? (
                  <div className="flex items-center text-amber-600">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    <span className="text-xs font-medium">
                      Add at least one item with quantity and rate to continue
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <span className="text-xs">✓ Items added! You can now add notes or save the invoice.</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentTab("basic")}
                  size="sm"
                  className="flex items-center gap-1 text-xs px-3 py-1 h-7"
                >
                  <ArrowRight className="w-3 h-3 rotate-180" />
                  Back to Basic
                </Button>
                {isTabCompleted("items") && (
                  <>
                    <Button
                      onClick={() => setCurrentTab("terms")}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 text-xs px-3 py-1 h-7"
                    >
                      Add Notes
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => handleSubmit(false)}
                      size="sm"
                      className="flex items-center gap-1 text-xs px-3 py-1 h-7 bg-green-600 hover:bg-green-700"
                    >
                      Save Invoice
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Terms & Notes Tab */}
        <TabsContent value="terms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-semibold">Customer Notes</h3>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Narration (Visible on Invoice)</Label>
                  <Textarea
                    placeholder="Thanks for your business."
                    className="h-32 resize-none"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    This message will appear on the invoice
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-green-600" />
                  <h3 className="text-base font-semibold">Invoice Settings</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low</SelectItem>
                        <SelectItem value="normal">🟡 Normal</SelectItem>
                        <SelectItem value="high">🟠 High</SelectItem>
                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tags</Label>
                    <Input
                      placeholder="project, client, urgent..."
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Comma-separated tags for organization
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {showTerms && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <h3 className="text-base font-semibold">Terms & Conditions</h3>
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter your terms and conditions here..."
                    className="h-32 resize-none"
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                  />
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowTerms(!showTerms)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {showTerms ? "Hide" : "Add"} Terms & Conditions
            </Button>
          </div>

          {/* Navigation and Guidance for Terms Tab */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center text-blue-600">
                  <span className="text-xs">
                    Add customer notes and invoice settings. This section is optional but recommended.
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentTab("items")}
                  size="sm"
                  className="flex items-center gap-1 text-xs px-3 py-1 h-7"
                >
                  <ArrowRight className="w-3 h-3 rotate-180" />
                  Back to Items
                </Button>
                <Button
                  onClick={() => setCurrentTab("additional")}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 text-xs px-3 py-1 h-7"
                >
                  Additional Info
                  <ArrowRight className="w-3 h-3" />
                </Button>
                <Button
                  onClick={() => handleSubmit(false)}
                  size="sm"
                  className="flex items-center gap-1 text-xs px-3 py-1 h-7 bg-green-600 hover:bg-green-700"
                >
                  Save Invoice
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Additional Info Tab */}
        <TabsContent value="additional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-semibold">Payment Information</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Exchange Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1.0)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Payment Reference</Label>
                    <Input
                      placeholder="Reference number or ID"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-green-600" />
                  <h3 className="text-base font-semibold">Business Information</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Branch/Location ID</Label>
                    <Input
                      placeholder="e.g., HQ-001, BRANCH-NYC"
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Territory</Label>
                    <Input
                      placeholder="e.g., North Region, International"
                      value={territory}
                      onChange={(e) => setTerritory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Created By</Label>
                    <Input
                      placeholder="User name or ID"
                      value={createdBy}
                      onChange={(e) => setCreatedBy(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-semibold">Internal Notes</h3>
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Internal notes (not visible on invoice)..."
                  className="h-24 resize-none"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  These notes are for internal use only and won't appear on the invoice
                </p>
              </div>
            </div>
          </Card>

          {/* Navigation and Guidance for Additional Tab */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center text-blue-600">
                  <span className="text-xs">
                    Optional: Add payment details and business information for better record keeping.
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentTab("terms")}
                  size="sm"
                  className="flex items-center gap-1 text-xs px-3 py-1 h-7"
                >
                  <ArrowRight className="w-3 h-3 rotate-180" />
                  Back to Terms
                </Button>
                <Button
                  onClick={() => handleSubmit(false)}
                  size="sm"
                  className="flex items-center gap-1 text-xs px-3 py-1 h-7 bg-green-600 hover:bg-green-700"
                >
                  Save Invoice
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Components */}
      <CompanyForm
        open={companyFormOpen}
        onOpenChange={setCompanyFormOpen}
        onSave={(newCompany) => {
          console.log("New company saved:", newCompany);
        }}
      />

      <CustomerForm
        open={customerFormOpen}
        onOpenChange={setCustomerFormOpen}
        onSave={(newCustomer) => {
          console.log("New customer saved:", newCustomer);
        }}
      />

      <ItemForm
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        onSave={handleSaveItem}
      />

      {/* Download Invoice Dialog */}
      <AlertDialog
        open={showDownloadDialog}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setShowDownloadDialog(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invoice Saved Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              Your invoice has been saved. Would you like to download a PDF copy?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                if (pdfUrl) {
                  setShowPdfPreview(true);
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
