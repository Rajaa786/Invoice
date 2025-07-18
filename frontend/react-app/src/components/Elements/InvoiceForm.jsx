import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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
import BankForm from "./BankForm";
import { generateInvoicePDF } from "./generateInvoicePDF";
import { templateLogger } from "../../utils/templateLogger";
import { useCompanyConfiguration } from "../../hooks/useConfiguration";
import { toast } from "react-hot-toast";
import { Switch } from "../ui/switch";
import { getCustomerStateCode, getCompanyStateCode, calculateGSTAmounts } from "../../shared/constants/GSTConfig";

const InvoiceForm = () => {
  const params = useParams(); // Get URL parameters including invoice ID
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
  // const [paymentTerms, setPaymentTerms] = useState("");
  const [termSelectOpen, setTermSelectOpen] = useState(false);
  const [customTerm, setCustomTerm] = useState(""); // track typed input
  const [isPaid, setIsPaid] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    date: new Date(),
    method: "",
    notes: "",
  });
  const [paymentDateOpen, setPaymentDateOpen] = useState(false);


  const defaultTerms = ["0", "15", "30", "45", "60", "90"];

  // New configuration hooks
  const { getCompanyInitials, setCompanyInitials: saveCompanyInitials } = useCompanyConfiguration();

  // Change this line
  const [invoiceNumber, setInvoiceNumber] = useState(""); // Remove the default "INV-000002"

  // Helper function to generate company initials from company name
  const generateCompanyInitials = (companyName) => {
    if (!companyName || typeof companyName !== 'string') return "";

    // Clean the company name - remove extra spaces and special characters for processing
    const cleanName = companyName.trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');

    if (!cleanName) return "";

    // Split by spaces to get words
    const words = cleanName.split(' ').filter(word => word.length > 0);

    if (words.length === 0) return "";

    if (words.length === 1) {
      // Single word: take first 3-6 characters depending on length
      const singleWord = words[0].toUpperCase();
      if (singleWord.length <= 3) {
        return singleWord; // "IBM" → "IBM", "3M" → "3M"
      } else if (singleWord.length <= 6) {
        return singleWord.substring(0, 4); // "Apple" → "APPL", "Google" → "GOOG"
      } else {
        return singleWord.substring(0, 3); // "Microsoft" → "MIC", "Facebook" → "FAC"
      }
    } else {
      // Multiple words: take first letter of each word
      const initials = words
        .map(word => word[0]?.toUpperCase() || "")
        .join("")
        .substring(0, 6);

      // If we get very short initials from multiple words, pad with more letters
      if (initials.length < 3 && words.length === 2) {
        // For 2 words with short result, take 2 chars from first word + 1 from second
        const firstWord = words[0].toUpperCase();
        const secondWord = words[1].toUpperCase();
        return (firstWord.substring(0, 2) + secondWord.substring(0, 1)).substring(0, 6);
      }

      return initials;
    }
  };

  // Additional schema fields
  const [invoiceType, setInvoiceType] = useState("proforma"); // 'tax' or 'proforma'
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
  const [convertedFromId, setConvertedFromId] = useState(null); // For tracking if this invoice was converted from a Proforma

  // Bank details state
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
  });
  const [savedBanks, setSavedBanks] = useState([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [bankSelectOpen, setBankSelectOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [bankFormOpen, setBankFormOpen] = useState(false);

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

  // Load saved banks for the selected company
  useEffect(() => {
    const fetchSavedBanks = async () => {
      if (!selectedCompany || !selectedCompany.id) {
        setSavedBanks([]);
        return;
      }
      setIsLoadingBanks(true);
      try {
        // Use the correct API to fetch banks for the selected company
        const response = await window.electron.getCompanyBanks(selectedCompany.id);
        if (response.success) {
          setSavedBanks(response.banks || response.data || []);
          console.log("Saved banks:", response.banks || response.data || []);
        } else {
          setSavedBanks([]);
          console.error("Failed to fetch banks:", response.error);
        }
      } catch (error) {
        setSavedBanks([]);
        console.error("Error fetching banks:", error);
      } finally {
        setIsLoadingBanks(false);
      }
    };
    fetchSavedBanks();
  }, [selectedCompany]);

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

          // Only load all items if no company is selected
          if (!selectedCompany || !selectedCompany.id) {
            setDbItems(formattedItems);
          }
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
  }, [selectedCompany]);
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

          // Only load all customers if no company is selected
          if (!selectedCompany || !selectedCompany.id) {
            setCustomers(customersData);
          }
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
  }, [selectedCompany]);
  // Add this with your other useEffects
  useEffect(() => {
    if (companyInitials) {
      setInvoiceNumber(`${companyInitials}${invoiceSequence}`);
    }
  }, [companyInitials, invoiceSequence]);


  useEffect(() => {
    // Fetch all invoices to find the latest invoice number
    const fetchLatestInvoiceNumber = async () => {
      try {
        if (!companyInitials) {
          console.log("No company initials available");
          return;
        }

        const prefix = companyInitials;
        console.log("Fetching invoice number with prefix:", prefix, "and type:", invoiceType);

        const response = await window.electron.getNextInvoiceNumber(prefix, invoiceType);
        console.log("Got invoice number response:", response);

        if (!response || !response.success) {
          console.error("Error getting next invoice number:", response?.error || "Unknown error");
          // Set a default invoice number as fallback
          const typePrefix = invoiceType === 'proforma' ? 'PRO-' : '';
          const fallbackNumber = `${typePrefix}${prefix}0001`;
          console.log("Using fallback invoice number:", fallbackNumber);
          setInvoiceNumber(fallbackNumber);
          setInvoiceSequence("0001");
          return;
        }

        const invoiceNumber = response.invoiceNumber;
        console.log("Received invoice number:", invoiceNumber);

        // Extract sequence number from the end of the invoice number
        // For Proforma invoices, we need to account for the 'PRO-' prefix
        const typePrefix = invoiceType === 'proforma' ? 'PRO-' : '';
        const prefixLength = typePrefix.length + prefix.length;
        const sequence = invoiceNumber.substring(prefixLength);

        if (sequence && !isNaN(parseInt(sequence, 10))) {
          console.log("Setting invoice number to:", invoiceNumber);
          setInvoiceNumber(invoiceNumber);
          setInvoiceSequence(sequence);
        } else {
          console.warn("Invalid sequence number:", sequence);
          setInvoiceNumber(`${typePrefix}${prefix}0001`);
          setInvoiceSequence("0001");
        }
      } catch (error) {
        console.error("Error in fetchLatestInvoiceNumber:", error);
        // Set a default invoice number as fallback
        const typePrefix = invoiceType === 'proforma' ? 'PRO-' : '';
        const fallbackNumber = `${typePrefix}${companyInitials}0001`;
        console.log("Using fallback invoice number after error:", fallbackNumber);
        setInvoiceNumber(fallbackNumber);
        setInvoiceSequence("0001");
      }
    };

    fetchLatestInvoiceNumber();
  }, [companyInitials, invoiceType]);

  useEffect(() => {
    // Only run this when a company is selected
    if (selectedCompany && selectedCompany.id) {
      // Fetch company-specific latest invoice
      fetchCompanyLatestInvoice(selectedCompany.id, companyInitials);

      // Fetch customers associated with this company
      fetchCompanyCustomers(selectedCompany.id);

      // Fetch items associated with this company
      fetchCompanyItems(selectedCompany.id);
    }
  }, [selectedCompany]); // This should run when selectedCompany changes

  // State for invoice items
  const [items, setItems] = useState([
    {
      id: 1,
      details: "",
      quantity: "1.00",
      rate: "0.00",
      amount: "0.00",
      hsn: "",
      dbItemId: null, // Add this field to store the actual database item ID
    },
  ]);

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
        hsn: "",
        dbItemId: null, // Initialize dbItemId as null for new rows
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

  // Fetch customers associated with a specific company
  const fetchCompanyCustomers = async (companyId) => {
    try {
      setIsLoadingCustomers(true);
      // First get all customers
      const allCustomersResponse = await window.electron.getCustomer();

      if (allCustomersResponse.success) {
        // Get customers associated with this company
        const companyCustomersPromises = allCustomersResponse.customers.map(async (customer) => {
          const customerCompaniesResponse = await window.electron.getCustomerCompanies(customer.id);
          if (customerCompaniesResponse.success && customerCompaniesResponse.result) {
            // Check if this customer is associated with the selected company
            return customerCompaniesResponse.result.some(company => company.id === companyId) ? customer : null;
          }
          return null;
        });

        const companyCustomersResults = await Promise.all(companyCustomersPromises);
        const filteredCustomers = companyCustomersResults.filter(customer => customer !== null);

        setCustomers(filteredCustomers);
        console.log(`Loaded ${filteredCustomers.length} customers for company ID ${companyId}`);
      } else {
        console.error("Failed to fetch customers:", allCustomersResponse.error);
      }
    } catch (error) {
      console.error("Error fetching company customers:", error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Fetch items associated with a specific company
  const fetchCompanyItems = async (companyId) => {
    try {
      setIsLoadingItems(true);
      // First get all items
      const allItemsResponse = await window.electron.getItem();

      if (allItemsResponse.success) {
        // Get items associated with this company
        const companyItemsPromises = allItemsResponse.items.map(async (item) => {
          const itemCompaniesResponse = await window.electron.getItemCompanies(item.id);
          if (itemCompaniesResponse.success && itemCompaniesResponse.companies) {
            // Check if this item is associated with the selected company
            return itemCompaniesResponse.companies.some(company => company.id === companyId) ? item : null;
          }
          return null;
        });

        const companyItemsResults = await Promise.all(companyItemsPromises);
        const filteredItems = companyItemsResults.filter(item => item !== null);

        // Transform the items to match the format needed for the dropdown
        const formattedItems = filteredItems.map((item) => ({
          id: item.id,
          name: item.name,
          rate: item.sellingPrice?.toString() || "0.00",
          description: item.description || "",
          unit: item.unit || "",
          hsn: item.hsnSacCode || "", // Include HSN code
        }));

        setDbItems(formattedItems);
        console.log(`Loaded ${formattedItems.length} items for company ID ${companyId}`);
      } else {
        console.error("Failed to fetch items:", allItemsResponse.error);
      }
    } catch (error) {
      console.error("Error fetching company items:", error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Handle saving new customer
  const handleSaveCustomer = (customerData) => {
    console.log("New customer data:", customerData);
  };
  // Add after your other handler functions
  const handleCompanySelect = async (companyId) => {
    console.log("🏢 Selecting company with ID:", companyId);

    // Find the company
    const company = companies.find(
      (company) => String(company.id) === String(companyId)
    );

    if (company) {
      setSelectedCompany(company);

      try {
        // Use configuration service which already handles database-first approach
        let initials = await getCompanyInitials(company.id);

        // If no initials found, generate from company name and save
        if (!initials) {
          initials = generateCompanyInitials(company.companyName);
          console.log("✅ Generated new initials:", initials);

          // Save the new initials (configuration service handles database + local storage)
          await saveCompanyInitials(company.id, initials);
          console.log("✅ Saved new initials to storage");
        } else {
          console.log("✅ Retrieved existing initials:", initials);
        }

        setCompanyInitials(initials);

        // Get company-specific latest invoice number
        fetchCompanyLatestInvoice(company.id, initials);

        // Fetch company-specific customers and items
        fetchCompanyCustomers(company.id);
        fetchCompanyItems(company.id);
      } catch (error) {
        console.error("❌ Error handling company selection:", error);

        // Fallback: generate initials from company name
        const fallbackInitials = generateCompanyInitials(company.companyName);
        setCompanyInitials(fallbackInitials);
        console.log("🔄 Using fallback initials:", fallbackInitials);
      }
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
            // Extract the sequence number from the end of the invoice number
            const invoiceNo = latestInvoice.invoiceNo;
            const prefixLength = initials.length;
            const latestSequence = invoiceNo.substring(prefixLength);

            // Preserve the original sequence length for proper padding
            const originalSequenceLength = latestSequence.length;
            const sequenceNumber = parseInt(latestSequence, 10);

            if (!isNaN(sequenceNumber)) {
              const newSequence = (sequenceNumber + 1)
                .toString()
                .padStart(originalSequenceLength, "0");
              setInvoiceSequence(newSequence);
              setInvoiceNumber(`${initials}${newSequence}`);
              return;
            }
          }
        }

        // If no invoices found for this company or invalid format, start from 0001
        setInvoiceSequence("0001");
        setInvoiceNumber(`${initials}0001`);
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
      try {
        console.log("🔄 Updating company initials to:", newInitials);

        // Use configuration service which handles database + local storage
        const success = await saveCompanyInitials(selectedCompany.id, newInitials);

        if (success) {
          // Update current initials
          setCompanyInitials(newInitials);
          // Update invoice number
          setInvoiceNumber(`${newInitials}${invoiceSequence}`);
          console.log("✅ Company initials updated successfully");
        } else {
          console.error("❌ Failed to save company initials");
        }
      } catch (error) {
        console.error("❌ Error updating company initials:", error);
      }
    }
  };
  const handleSequenceChange = (value) => {
    setInvoiceSequence(value);
    setInvoiceNumber(`${companyInitials}${value}`);
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
        dbItemId: selectedItem.id, // Ensure dbItemId is set for duplicate items too
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
        // Add debugging to verify values
        console.log("Selected item:", selectedItem);
        console.log("Setting dbItemId to:", selectedItem.id);
        return {
          ...item,
          details: selectedItem.name,
          rate: selectedItem.rate || "0.00",
          hsn: selectedItem.hsn || "",
          amount: (
            (parseFloat(item.quantity) || 1) *
            (parseFloat(selectedItem.rate) || 0)
          ).toFixed(2),
          dbItemId: selectedItem.id, // Set the database item ID here
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

  // Handle bank field changes
  const handleBankChange = (field, value) => {
    setBankDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle bank selection from saved banks
  const handleBankSelect = (bankId) => {
    const selectedBank = savedBanks.find(bank => String(bank.id) === String(bankId));
    if (selectedBank) {
      setBankDetails({
        bankName: selectedBank.bankName || "",
        accountNumber: selectedBank.accountNumber || "",
        ifscCode: selectedBank.ifscCode || "",
        branchName: selectedBank.branchName || "",
      });
      setSelectedBankId(bankId);
    }
  };

  // Handle saving new bank
  const handleSaveBank = (newBank) => {
    console.log("New bank saved:", newBank);
    // Add the new bank to the saved banks list
    const newBankWithId = {
      ...newBank,
      id: Date.now(), // Simple ID generation for demo
    };
    setSavedBanks(prev => [...prev, newBankWithId]);

    // Auto-select the newly added bank
    setBankDetails({
      bankName: newBank.bankName || "",
      accountNumber: newBank.accountNumber || "",
      ifscCode: newBank.ifscCode || "",
      branchName: newBank.branchName || "",
    });
    setSelectedBankId(newBankWithId.id);
  };
  // Handle converting a Proforma invoice to a Tax invoice
  const handleConvertProformaToTax = async (proformaInvoiceId) => {
    try {
      // Show loading toast
      toast.loading("Converting Proforma to Tax Invoice...");

      // Call the electron API to convert the Proforma invoice
      const response = await window.electron.convertProformaToTax(proformaInvoiceId);

      // Dismiss loading toast
      toast.dismiss();

      if (response.success) {
        // Show success message
        toast.success("Successfully converted to Tax Invoice");

        // Reset the form to prepare for a new invoice
        resetForm();

        // Redirect to the new tax invoice or refresh the current page
        // This depends on your application's routing structure
        window.location.href = `/invoices/${response.newInvoiceId}`;
        return true;
      } else {
        // Show error message
        toast.error(response.error || "Failed to convert invoice");
        return false;
      }
    } catch (error) {
      console.error("Error converting Proforma to Tax invoice:", error);
      toast.error("An unexpected error occurred");
      return false;
    }
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
      // Step 2: Calculate tax amounts and total using GSTConfig
      const customerStateCode = getCustomerStateCode(selectedCustomer);
      const companyStateCode = getCompanyStateCode(selectedCompany);

      // Calculate GST based on state comparison
      const gstDetails = calculateGSTAmounts(subtotal, customerStateCode, companyStateCode)


      const calculatedTotal = subtotal + gstDetails.totalGST;

      console.log("items max", items);
      // Step 3: Prepare invoice data for database
      const invoiceForDB = {
        companyId: selectedCompany.id,
        customerId: selectedCustomer.id,
        invoiceNumber: invoiceNumber,
        invoiceDate: invoiceDate,
        dueDate: isPaid && invoiceType === 'tax' ? null : dueDate,
        paymentTerms: paymentTerms,
        incomeLedger: incomeLedger,
        // Include invoice type and converted from ID if applicable
        invoiceType: invoiceType,
        convertedFromId: convertedFromId,
        items: items.map((item) => ({
          id: item.dbItemId, // Use the actual database item ID (backend expects 'id' field)
          details: item.details || "",
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0,
        })),
        subtotal: subtotal,
        cgstRate: gstDetails.cgstRate,
        sgstRate: gstDetails.sgstRate,
        igstRate: gstDetails.igstRate,
        cgstAmount: gstDetails.cgstAmount,
        sgstAmount: gstDetails.sgstAmount,
        igstAmount: gstDetails.igstAmount,
        totalAmount: calculatedTotal,
        discountAmount: discountAmount,
        discountPercentage: discountPercentage,
        customerNotes: customerNotes,
        termsAndConditions: termsAndConditions,
        status: isDraft ? "draft" : (isPaid && invoiceType === 'tax' ? "paid" : "pending"),
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
        isPaid,
        // Add payment details if invoice is marked as paid
        ...(isPaid && invoiceType === 'tax' && {
          paidDate: paymentDetails.date,
          paymentMethod: paymentDetails.method,
          paymentReference: paymentDetails.notes || "",
        }),
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
      const savedInvoiceData = { ...invoiceForDB, id: result.data.id };
      setSavedInvoice(savedInvoiceData);

      // Check if this is a paid invoice and update payment status
      if (savedInvoiceData.status === 'paid' && savedInvoiceData.paidDate) {
        setIsPaid(true);
        setPaymentDetails({
          amount: savedInvoiceData.totalAmount || 0,
          date: new Date(savedInvoiceData.paidDate),
          method: savedInvoiceData.paymentMethod || "",
          notes: savedInvoiceData.paymentReference || "",
        });
      }

      // If invoice was marked as paid during creation, update payment details in database
      if (isPaid && invoiceType === 'tax' && savedInvoiceData.id) {
        try {
          const response = await window.electron.updateInvoicePayment({
            invoiceId: savedInvoiceData.id,
            paymentData: {
              date: paymentDetails.date,
              method: paymentDetails.method,
              notes: paymentDetails.notes
            }
          });

          if (response.success) {
            console.log("Payment details updated successfully for new invoice");
          } else {
            console.error("Failed to update payment details:", response.error);
          }
        } catch (error) {
          console.error("Error updating payment details for new invoice:", error);
        }
      }

      // Step 6: Prepare properly formatted data for PDF generation
      const invoiceForPDF = {
        invoiceNumber: invoiceNumber || "SI-0001599",
        invoiceDate: invoiceDate,
        dueDate: dueDate,
        // Add payment date if invoice is marked as paid
        paidDate: isPaid && invoiceType === 'tax' ? paymentDetails.date : null,
        // Add payment terms
        paymentTerms: paymentTerms,
        customerNotes: customerNotes,
        termsAndConditions: termsAndConditions,
        // GST details including isIntraState flag
        subtotal: subtotal,
        cgstRate: gstDetails.cgstRate,
        sgstRate: gstDetails.sgstRate,
        igstRate: gstDetails.igstRate,
        cgstAmount: gstDetails.cgstAmount,
        sgstAmount: gstDetails.sgstAmount,
        igstAmount: gstDetails.igstAmount,
        totalGST: gstDetails.totalGST,
        isIntraState: gstDetails.isIntraState,
        totalAmount: calculatedTotal,

        // Debug logging for GST flow
        _debug: {
          gstCalculation: {
            customerStateCode: getCustomerStateCode(selectedCustomer),
            companyStateCode: getCompanyStateCode(selectedCompany),
            isIntraState: gstDetails.isIntraState,
            gstType: gstDetails.isIntraState ? 'CGST+SGST' : 'IGST'
          }
        },

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
          companyName: selectedCustomer.companyName || "",
          addressLine1: selectedCustomer.billingAddressLine1 || "",
          addressLine2: selectedCustomer.billingAddressLine2 || "",
          city: selectedCustomer.billingCity || "",
          state: selectedCustomer.billingState || "",
          country: selectedCustomer.billingCountry || "",
          zip: selectedCustomer.billingZip || "",
          email: selectedCustomer.billingEmail || "",
          contactNo: selectedCustomer.billingContactNo || "",
          phone: selectedCustomer.billingContactNo || "",
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
        dbItemId: null, // Initialize dbItemId as null for new rows
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
    // Reset invoice type to tax invoice
    setInvoiceType("tax");
    setConvertedFromId(null);
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

  const handlePaidSwitchToggle = async () => {
    const newPaidStatus = !isPaid;
    setIsPaid(newPaidStatus);

    if (newPaidStatus) {
      // When marking as paid, calculate the final total amount including taxes and discounts
      const customerStateCode = getCustomerStateCode(selectedCustomer);
      const companyStateCode = getCompanyStateCode(selectedCompany);

      // Calculate GST based on state comparison - always calculate GST
      const gstDetails = calculateGSTAmounts(subtotal, customerStateCode, companyStateCode);

      const finalTotal = subtotal + gstDetails.totalGST - discountAmount;

      const newPaymentDetails = {
        amount: finalTotal,
        date: new Date(),
        method: "cash",
        notes: "Initial payment",
      };

      setPaymentDetails(newPaymentDetails);

      // If we have a saved invoice, update its payment status in the database
      if (savedInvoice?.id) {
        try {
          const response = await window.electron.updateInvoicePayment({
            invoiceId: savedInvoice.id,
            paymentData: {
              date: newPaymentDetails.date,
              method: newPaymentDetails.method,
              notes: newPaymentDetails.notes
            }
          });

          if (response.success) {
            toast.success("Invoice marked as paid successfully!");
            // Update the saved invoice with new status
            setSavedInvoice(prev => ({
              ...prev,
              status: "paid",
              paidDate: newPaymentDetails.date,
              paymentMethod: newPaymentDetails.method,
              paymentReference: newPaymentDetails.notes
            }));
          } else {
            toast.error(response.error || "Failed to mark invoice as paid");
            // Revert the switch if the update failed
            setIsPaid(false);
          }
        } catch (error) {
          console.error("Error updating invoice payment status:", error);
          toast.error("An error occurred while marking invoice as paid");
          // Revert the switch if the update failed
          setIsPaid(false);
        }
      }
    } else {
      // When marking as unpaid, recalculate a default due date
      const days = parseInt(paymentTerms || "30", 10);
      const newDueDate = addDays(new Date(invoiceDate), days);
      setDueDate(newDueDate);

      // If we have a saved invoice, update its payment status in the database
      if (savedInvoice?.id) {
        try {
          const response = await window.electron.markInvoiceUnpaid(savedInvoice.id);

          if (response.success) {
            toast.success("Invoice marked as unpaid successfully!");
            // Update the saved invoice with new status
            setSavedInvoice(prev => ({
              ...prev,
              status: "pending",
              paidDate: null,
              paymentMethod: null,
              paymentReference: null
            }));
          } else {
            toast.error(response.error || "Failed to mark invoice as unpaid");
            // Revert the switch if the update failed
            setIsPaid(true);
          }
        } catch (error) {
          console.error("Error marking invoice as unpaid:", error);
          toast.error("An error occurred while marking invoice as unpaid");
          // Revert the switch if the update failed
          setIsPaid(true);
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 leading-tight">New Invoice</h1>
          <p className="text-xs text-gray-600 mt-0">Create and manage your invoice details</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {invoiceNumber || "Draft"}
          </Badge>
        </div>
      </div>



      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <div className="space-y-2 mb-3">
          {/* Compact Progress Indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-1.5">
            <div className="flex items-center justify-between mb-0.5">
              <h3 className="text-xs font-medium text-blue-900">Progress</h3>
              <span className="text-xs text-blue-600">
                {completedTabs.size}/4
              </span>
            </div>
            <div className="flex space-x-1">
              {["basic", "items", "terms", "additional"].map((tab, index) => (
                <div key={tab} className="flex-1">
                  <div className={`h-1 rounded-full ${completedTabs.has(tab)
                    ? 'bg-green-500'
                    : currentTab === tab
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                    }`} />
                </div>
              ))}
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="basic" className="text-xs relative py-1">
              <div className="flex items-center">
                {completedTabs.has("basic") ? (
                  <div className="w-3 h-3 mr-1 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <Building className="w-3 h-3 mr-1" />
                )}
                <span>Basic</span>
                {!completedTabs.has("basic") && currentTab !== "basic" && (
                  <span className="ml-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger value="items" className="text-xs relative py-1">
              <div className="flex items-center">
                {completedTabs.has("items") ? (
                  <div className="w-3 h-3 mr-1 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <DollarSign className="w-3 h-3 mr-1" />
                )}
                <span>Items</span>
                {!completedTabs.has("items") && currentTab !== "items" && (
                  <span className="ml-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger value="terms" className="text-xs relative py-1">
              <div className="flex items-center">
                {completedTabs.has("terms") ? (
                  <div className="w-3 h-3 mr-1 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <FileText className="w-3 h-3 mr-1" />
                )}
                <span>Terms</span>
              </div>
            </TabsTrigger>

            <TabsTrigger value="additional" className="text-xs relative py-1">
              <div className="flex items-center">
                {completedTabs.has("additional") ? (
                  <div className="w-3 h-3 mr-1 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <Settings className="w-3 h-3 mr-1" />
                )}
                <span>More</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Basic Details Tab - Invoice Type at Top */}
        <TabsContent value="basic" className="space-y-3">
          {/* Invoice Type - Full Width, No Header */}
          <div className="border border-gray-200 rounded-md p-3">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className={`text-xs font-medium transition-colors duration-200 ${invoiceType === 'proforma' ? 'text-purple-600' : 'text-gray-500'}`}>Proforma</span>
                <button
                  onClick={() => setInvoiceType(invoiceType === 'tax' ? 'proforma' : 'tax')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${invoiceType === 'tax' ? 'bg-green-500 focus:ring-green-500' : 'bg-purple-500 focus:ring-purple-500'}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${invoiceType === 'tax' ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
                <span className={`text-xs font-medium transition-colors duration-200 ${invoiceType === 'tax' ? 'text-green-600' : 'text-gray-500'}`}>Tax Invoice</span>
              </div>
              {/* Visual Card Display */}
              <div className="relative h-16 overflow-hidden">
                {/* Proforma Invoice Card */}
                <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${invoiceType === 'proforma' ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-2 pointer-events-none'}`}>
                  <div className="relative bg-white border border-purple-200 rounded-md p-3 h-full">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0H8m0 0V5a1 1 0 011-1h6a1 1 0 011 1v2m-6 0h6m-6 0H8m0 0v10a1 1 0 001 1h6a1 1 0 001-1V7H8z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-900">Proforma Invoice</h4>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <span className="w-1 h-1 bg-purple-500 rounded-full mr-1"></span> DRAFT
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Draft document for quotations</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Tax Invoice Card */}
                <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${invoiceType === 'tax' ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-2 pointer-events-none'}`}>
                  <div className="relative bg-white border border-green-200 rounded-md p-3 h-full">
                    <div className="flex items-center justify-between h-full">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-gray-900">Tax Invoice</h4>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <span className="w-1 h-1 bg-green-500 rounded-full mr-1"></span> GST
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">Official legal document</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isPaid && invoiceType === 'tax' && (
                          <Badge className="bg-green-100 text-green-800 border border-green-300 px-2 py-1">
                            <span className="mr-1">✓</span> PAID
                          </Badge>
                        )}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <Label htmlFor="paid-switch" className="text-xs font-medium text-blue-900 whitespace-nowrap">
                                Mark as paid
                              </Label>
                            </div>
                            <Switch
                              id="paid-switch"
                              checked={isPaid}
                              onCheckedChange={handlePaidSwitchToggle}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column: Core Invoice Details */}
            <div className="space-y-3">
              {/* Company Information */}
              <div className="border border-gray-200 rounded-md p-2">
                <div className="flex items-center gap-2 mb-1">
                  <Building className="w-3 h-3 text-blue-600" />
                  <h3 className="text-sm font-medium">Company Information</h3>
                </div>

                <div className="space-y-1">
                  {/* <Label className="text-xs font-medium">Select Company *</Label> */}
                  <div className="flex items-center gap-2">
                    {selectedCompany && selectedCompany.logo && (
                      <div className="h-8 w-8 rounded border overflow-hidden flex-shrink-0">
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
                      <SelectTrigger className="h-9 text-xs">
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
                          <div className="p-2 border-b flex gap-2">
                            <CommandInput placeholder="Search companies..." className="flex-1" />
                            <Button
                              size="sm"
                              onClick={() => setCompanyFormOpen(true)}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add New
                            </Button>
                          </div>
                          <CommandEmpty>
                            <div className="p-3 text-center text-muted-foreground">
                              <p className="text-sm">No companies found</p>
                              <p className="text-xs mt-1">Click "Add New" to create one</p>
                            </div>
                          </CommandEmpty>
                          <CommandGroup className="max-h-40 overflow-y-auto">
                            {companies.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={String(company.id)}
                                onSelect={(value) => {
                                  handleCompanySelect(value);
                                  setCompanySelectOpen(false);
                                }}
                                className="flex items-center gap-3 p-2"
                              >
                                {company.logo && (
                                  <div className="h-6 w-6 rounded overflow-hidden flex-shrink-0">
                                    <img
                                      src={company.logo}
                                      alt={`${company.companyName} logo`}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                )}
                                <span className="text-sm">{company.companyName}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Invoice Fields */}
              <div className="border border-gray-200 rounded-md p-2">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3 h-3 text-purple-600" />
                  <h3 className="text-sm font-medium">Invoice Details</h3>
                </div>

                <hr className="mb-2 border-gray-200" />

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Invoice Number</Label>
                    <div className="flex gap-1">
                      <Input
                        value={companyInitials}
                        onChange={(e) =>
                          updateCompanyInitials(e.target.value.toUpperCase().slice(0, 6))
                        }
                        className="w-16 text-center h-9 !text-xs"
                        maxLength={6}
                        placeholder="ABC"
                      />
                      <Input
                        value={invoiceSequence}
                        onChange={(e) => handleSequenceChange(e.target.value)}
                        className="flex-1 h-9 !text-xs"
                        placeholder="0001"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Income Ledger</Label>
                    <Input
                      id="incomeLedger"
                      placeholder="Sales"
                      value={incomeLedger}
                      onChange={(e) => setIncomeLedger(e.target.value)}
                      className="h-9 !text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Invoice Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left h-9 text-xs">
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

                  {!(invoiceType === 'tax' && isPaid) && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left h-9 text-xs">
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

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Payment Terms</Label>
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
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2 border-b">
                              <input
                                type="number"
                                placeholder="Enter custom days..."
                                className="w-full px-2 py-1 border rounded text-xs"
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
                    </>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Reference</Label>
                    <Input
                      placeholder="Optional reference"
                      className="h-9 !text-xs"
                    />
                  </div>

                </div>
              </div>

              {/* Payment Details Section - Only show for Tax Invoices when marked as paid */}
              {invoiceType === 'tax' && isPaid && (
                <div className="border border-green-200 rounded-md p-2 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="text-sm font-medium text-green-900">Payment Details</h3>
                  </div>
                  <hr className="mb-2 border-green-200" />



                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Payment Date</Label>
                      <Popover open={paymentDateOpen} onOpenChange={setPaymentDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left h-9 text-xs">
                            {paymentDetails.date instanceof Date && !isNaN(paymentDetails.date)
                              ? format(paymentDetails.date, "dd/MM/yyyy")
                              : "Select date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={paymentDetails.date}
                            onSelect={(date) => {
                              if (date && date <= new Date()) {
                                setPaymentDetails(prev => ({
                                  ...prev,
                                  date
                                }));
                                // Auto-close the popover after date selection
                                setPaymentDateOpen(false);
                              }
                            }}
                            initialFocus
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Payment Method</Label>
                      <Select
                        value={paymentDetails.method}
                        onValueChange={(value) => setPaymentDetails(prev => ({
                          ...prev,
                          method: value
                        }))}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="online">Online Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>




                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Configuration & Customer */}
            <div className="space-y-3">
              {/* Customer Information */}
              <div className="border border-gray-200 rounded-md p-2">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3 h-3 text-green-600" />
                  <h3 className="text-sm font-medium">Customer Information</h3>
                </div>

                <div className="space-y-1">
                  {/* <Label className="text-xs font-medium">Select Customer *</Label> */}
                  <Select
                    open={customerSelectOpen}
                    onOpenChange={setCustomerSelectOpen}
                    onValueChange={(value) => {
                      handleCustomerSelect(value);
                      setCustomerSelectOpen(false);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
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
                        <div className="p-2 border-b flex gap-2">
                          <CommandInput placeholder="Search customers..." className="flex-1" />
                          <Button
                            size="sm"
                            onClick={() => setCustomerFormOpen(true)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add New
                          </Button>
                        </div>
                        <CommandEmpty>
                          <div className="p-3 text-center text-muted-foreground">
                            <p className="text-sm">No customers found</p>
                            <p className="text-xs mt-1">Click "Add New" to create one</p>
                          </div>
                        </CommandEmpty>
                        <CommandGroup className="max-h-40 overflow-y-auto">
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
                                className="p-2"
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

              {/* Simplified Bank Details Component */}
              <div className="border border-gray-200 rounded-md p-2">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-3 h-3 text-blue-600" />
                  <h3 className="text-sm font-medium">Bank Details</h3>
                </div>

                {/* State 1: Selection View */}
                {!selectedBankId && (
                  <div className="space-y-1">
                    <Select
                      open={bankSelectOpen}
                      onOpenChange={setBankSelectOpen}
                      onValueChange={(value) => {
                        handleBankSelect(value);
                        setBankSelectOpen(false);
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select a bank account" />
                      </SelectTrigger>
                      <SelectContent className="p-0">
                        <Command>
                          <div className="p-2 border-b flex gap-2">
                            <CommandInput placeholder="Search bank accounts..." className="flex-1" />
                            <Button
                              size="sm"
                              onClick={() => setBankFormOpen(true)}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add New
                            </Button>
                          </div>
                          <CommandEmpty>
                            <div className="p-3 text-center text-muted-foreground">
                              <p className="text-sm">No bank accounts found</p>
                              <p className="text-xs mt-1">Click "Add New" to create one</p>
                            </div>
                          </CommandEmpty>
                          <CommandGroup className="max-h-40 overflow-y-auto">
                            {isLoadingBanks ? (
                              <CommandItem disabled>Loading bank accounts...</CommandItem>
                            ) : savedBanks.length === 0 ? (
                              <CommandItem disabled>No bank accounts found</CommandItem>
                            ) : (
                              savedBanks.map((bank) => (
                                <CommandItem
                                  key={bank.id}
                                  value={String(bank.id)}
                                  onSelect={(value) => {
                                    handleBankSelect(value);
                                    setBankSelectOpen(false);
                                  }}
                                  className="flex items-center gap-2 p-2"
                                >
                                  <span className="text-xs font-medium">{bank.bankName}</span>
                                  <span className="text-xs text-gray-500">{bank.accountNumber}</span>
                                </CommandItem>
                              ))
                            )}
                          </CommandGroup>
                        </Command>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* State 2: Display & Remove View */}
                {selectedBankId && (
                  <div className="p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700">Selected Account</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBankId(null);
                            setBankDetails({
                              bankName: "",
                              accountNumber: "",
                              ifscCode: "",
                              branchName: "",
                            });
                          }}
                          className="h-6 px-2 text-xs text-gray-600 hover:text-gray-700"
                        >
                          Change
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBankId(null);
                            setBankDetails({
                              bankName: "",
                              accountNumber: "",
                              ifscCode: "",
                              branchName: "",
                            });
                          }}
                          className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                        >
                          🗑️ Remove
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">{bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-medium">XXXXXX{bankDetails.accountNumber.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IFSC Code:</span>
                        <span className="font-medium">{bankDetails.ifscCode}</span>
                      </div>
                      {bankDetails.branchName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Branch:</span>
                          <span className="font-medium">{bankDetails.branchName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Navigation for Basic Tab */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {!isTabCompleted("basic") ? (
                  <div className="flex items-center text-amber-600">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                    <span className="text-xs">
                      Select company and customer to continue
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <span className="text-xs">✓ Basic details completed</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {isTabCompleted("basic") && (
                  <Button
                    onClick={() => setCurrentTab("items")}
                    size="sm"
                    className="flex items-center gap-1 text-xs px-2 py-1 h-6"
                  >
                    Next: Items
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Items & Pricing Tab */}
        <TabsContent value="items" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-semibold">Invoice Items</h3>
                </div>
                {/* Removed buttons from header - they'll be placed more intuitively */}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 h-8">
                      <TableHead className="w-[40%] text-xs px-2 py-1">Item Details</TableHead>
                      <TableHead className="text-center w-[12%] text-xs px-2 py-1">HSN/SAC</TableHead>
                      <TableHead className="text-center w-[12%] text-xs px-2 py-1">Quantity</TableHead>
                      <TableHead className="text-center w-[12%] text-xs px-2 py-1">Rate (₹)</TableHead>
                      <TableHead className="text-center w-[12%] text-xs px-2 py-1">Amount (₹)</TableHead>
                      <TableHead className="w-[8%] text-xs px-2 py-1"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50 h-9">
                        <TableCell className="px-2 py-1">
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
                            <SelectTrigger className="w-full h-9 text-xs">
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

                        <TableCell className="px-2 py-1">
                          <Input
                            value={item.hsn || ""}
                            className="text-center h-9 text-xs"
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

                        <TableCell className="px-2 py-1">
                          <Input
                            type="number"
                            step="1"
                            pattern="[0-9]*"
                            value={item.quantity}
                            className="text-center h-9 text-xs"
                            onChange={(e) => {
                              // Only allow whole numbers
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              updateItemAmount(item.id, value, item.rate);
                            }}
                          />
                        </TableCell>

                        <TableCell className="px-2 py-1">
                          <Input
                            value={item.rate}
                            className="text-center h-9 text-xs"
                            onChange={(e) => {
                              updateItemAmount(item.id, item.quantity, e.target.value);
                            }}
                          />
                        </TableCell>

                        <TableCell className="px-2 py-1">
                          <Input
                            value={item.amount}
                            className="text-center h-9 bg-gray-50 text-xs"
                            readOnly
                          />
                        </TableCell>

                        <TableCell className="px-2 py-1">
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

              {/* Action Buttons - Now placed where users naturally look after completing a row */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-1">
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={addNewRow}
                    size="sm"
                    className="flex items-center gap-1 text-xs px-3 py-1 h-7 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3" />
                    Add Item
                  </Button>
                  <button
                    onClick={() => {
                      const newRows = Array.from({ length: 5 }, (_, index) => ({
                        id: items.length + index + 1,
                        details: "",
                        quantity: "1.00",
                        rate: "0.00",
                        amount: "0.00",
                        hsn: "",
                        dbItemId: null,
                      }));
                      setItems([...items, ...newRows]);
                    }}
                    className="text-xs text-gray-600 hover:text-gray-800 underline hover:no-underline"
                  >
                    + Bulk Add (5 rows)
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Totals Section - compact */}
              <div className="border-t pt-3 mt-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs font-medium mb-1 block">Discount</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={discountPercentage}
                          onChange={(e) => {
                            const percentage = parseFloat(e.target.value) || 0;
                            setDiscountPercentage(percentage);
                            setDiscountAmount((subtotal * percentage) / 100);
                          }}
                          className="w-20 min-w-[4.5rem] h-7 text-xs text-right"
                          placeholder="0"
                        />
                        <span className="text-xs">%</span>
                        <span className="text-xs text-gray-500">or</span>
                        <Input
                          type="number"
                          value={discountAmount}
                          onChange={(e) => {
                            const amount = parseFloat(e.target.value) || 0;
                            setDiscountAmount(amount);
                            setDiscountPercentage(subtotal > 0 ? (amount / subtotal) * 100 : 0);
                          }}
                          className="min-w-[4.5rem] w-auto h-7 text-xs text-right"
                          placeholder="0.00"
                        />
                        <span className="text-xs">₹</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-72 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount ({discountPercentage.toFixed(1)}%):</span>
                        <span className="font-medium text-red-600">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxable Amount:</span>
                      <span className="font-medium">₹{(subtotal - discountAmount).toFixed(2)}</span>
                    </div>

                    {(() => {
                      const taxableAmount = subtotal - discountAmount;

                      const gstDetails = calculateGSTAmounts(taxableAmount, getCustomerStateCode(selectedCustomer), getCompanyStateCode(selectedCompany));

                      const isIntraState = gstDetails.isIntraState;

                      return (
                        <>
                          {isIntraState ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">CGST ({gstDetails.cgstRate}%):</span>
                                <span className="font-medium">₹{gstDetails.cgstAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">SGST ({gstDetails.sgstRate}%):</span>
                                <span className="font-medium">₹{gstDetails.sgstAmount.toFixed(2)}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between">
                              <span className="text-gray-600">IGST ({gstDetails.igstRate}%):</span>
                              <span className="font-medium">₹{gstDetails.igstAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t pt-1 mt-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold">Total:</span>
                              <span className="font-bold text-blue-600">
                                ₹{(taxableAmount + gstDetails.totalGST).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {/* Payment Status Summary - Only show for paid invoices */}
                    {isPaid && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Payment Status:</span>
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <span className="mr-1">✔️</span>
                            PAID
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Paid on {format(paymentDetails.date, "dd MMM yyyy")} via {paymentDetails.method || "Payment"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation and Guidance for Items Tab */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-1.5">
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
        <TabsContent value="terms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-semibold">Customer Notes</h3>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Narration (Visible on Invoice)</Label>
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

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-semibold">Invoice Settings</h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Priority</Label>
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
                    <Label className="text-xs font-medium">Tags</Label>
                    <Input
                      placeholder="project, client, urgent..."
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="text-xs"
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
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-semibold">Terms & Conditions</h3>
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-1.5">
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
        <TabsContent value="additional" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-semibold">Payment Information</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Currency</Label>
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
                      <Label className="text-xs font-medium">Exchange Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1.0)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Payment Method</Label>
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
                    <Label className="text-xs font-medium">Payment Reference</Label>
                    <Input
                      placeholder="Reference number or ID"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-semibold">Business Information</h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Branch/Location ID</Label>
                    <Input
                      placeholder="e.g., HQ-001, BRANCH-NYC"
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Territory</Label>
                    <Input
                      placeholder="e.g., North Region, International"
                      value={territory}
                      onChange={(e) => setTerritory(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Created By</Label>
                    <Input
                      placeholder="User name or ID"
                      value={createdBy}
                      onChange={(e) => setCreatedBy(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold">Internal Notes</h3>
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-1.5">
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

      <BankForm
        open={bankFormOpen}
        onOpenChange={setBankFormOpen}
        onSave={handleSaveBank}
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

      {/* Floating Action Button for Converting Proforma to Tax Invoice */}
      {
        invoiceType === 'proforma' && params && params.id && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => handleConvertProformaToTax(params.id)}
              className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
              title="Convert to Tax Invoice"
            >
              <DollarSign className="h-6 w-6" />
            </Button>
            <div className="mt-2 text-center text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded-md shadow">
              Convert to Tax
            </div>
          </div>
        )
      }
    </div >
  );
};

export default InvoiceForm;

