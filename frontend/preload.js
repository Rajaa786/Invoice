const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  addItems: (data) => ipcRenderer.invoke("add-items", data),
  addCompany: (data) => ipcRenderer.invoke("add-company", data),
  getCompany: () => ipcRenderer.invoke("get-company"),
  getCompanyImage: (imagePath) =>
    ipcRenderer.invoke("get-company-image", imagePath),
  getItem: () => ipcRenderer.invoke("get-Item"),
  addCustomer: (data) => ipcRenderer.invoke("add-customer", data),
  getCustomer: () => ipcRenderer.invoke("get-customer"),
  checkTallyRunning: (port) => ipcRenderer.invoke("check-tally-running", port),
  importLedgers: (companyName, port) =>
    ipcRenderer.invoke("import-ledgers", companyName, port),
  getTallyTransactions: (caseId) =>
    ipcRenderer.invoke("get-tally-transactions", caseId),
  addInvoice: (invoice) => ipcRenderer.invoke("add-invoice", invoice),
  addInvoiceItems: (invoiceItems) =>
    ipcRenderer.invoke("add-invoice-items", invoiceItems),

  getAllInvoiceItems: (invoiceId) => ipcRenderer.invoke("invoiceItem:getAll", invoiceId),

  getAllInvoices: () => ipcRenderer.invoke("invoice:getAll"),
  getInvoiceById: (id) => ipcRenderer.invoke("invoice:getById", id),
  uploadLedgerToTally: (data, port, tallyVersion) =>
    ipcRenderer.invoke("ledger-create", data, port, tallyVersion),
  uploadSalesToTally: (data, port) =>
    ipcRenderer.invoke("sales-create", data, port),
  storeTallyUpload: (uploadResponse, bankLedger, uploadData) =>
    ipcRenderer.invoke(
      "store-tally-upload",
      uploadResponse,
      bankLedger,
      uploadData
    ),
  getCompanyWithInvoices: () => ipcRenderer.invoke("get-company-with-invoices"),

  analytics: {
    getSummaryMetrics: (filters = {}) =>
      ipcRenderer.invoke("analytics:getSummaryMetrics", filters),

    getRevenueOverTime: (filters = {}) =>
      ipcRenderer.invoke("analytics:getRevenueOverTime", filters),

    getInvoiceStatusDistribution: (filters = {}) =>
      ipcRenderer.invoke("analytics:getInvoiceStatusDistribution", filters),

    getCustomerRevenueAnalysis: (filters = {}) =>
      ipcRenderer.invoke("analytics:getCustomerRevenueAnalysis", filters),

    getCompanySplit: (filters = {}) =>
      ipcRenderer.invoke("analytics:getCompanySplit", filters),

    getTopItemsAnalysis: (filters = {}) =>
      ipcRenderer.invoke("analytics:getTopItemsAnalysis", filters),

    getTaxLiabilityReport: (filters = {}) =>
      ipcRenderer.invoke("analytics:getTaxLiabilityReport", filters),

    getInvoiceAgingReport: (filters = {}) =>
      ipcRenderer.invoke("analytics:getInvoiceAgingReport", filters),

    getPaymentDelayAnalysis: (filters = {}) =>
      ipcRenderer.invoke("analytics:getPaymentDelayAnalysis", filters),

    clearCache: () =>
      ipcRenderer.invoke("analytics:clearCache"),

    subscribeToUpdates: (callback) => {
      ipcRenderer.on("analytics:dataUpdated", callback);
      return () => ipcRenderer.removeListener("analytics:dataUpdated", callback);
    }
  },

  // 🔧 Database Migration API
  migration: {
    // Run pending migrations
    runPending: () =>
      ipcRenderer.invoke("migration:runPending"),

    // Get migration status
    getStatus: () =>
      ipcRenderer.invoke("migration:getStatus"),

    // Check if schema is up to date
    isUpToDate: () =>
      ipcRenderer.invoke("migration:isUpToDate")
  },

  // 🔍 Zoom Level Monitoring API
  zoom: {
    // Get current zoom level
    getLevel: () =>
      ipcRenderer.invoke("get-zoom-level"),

    // Set zoom level
    setLevel: (level) =>
      ipcRenderer.invoke("set-zoom-level", level),

    // Subscribe to zoom level changes
    onZoomChanged: (callback) => {
      ipcRenderer.on("zoom-level-updated", (event, data) => callback(data));
      return () => ipcRenderer.removeListener("zoom-level-updated", callback);
    }
  },
});
