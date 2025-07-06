const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  // Item operations
  addItems: (data) => ipcRenderer.invoke("add-items", data),
  getItem: () => ipcRenderer.invoke("get-Item"),
  getItemById: (id) => ipcRenderer.invoke("get-item-by-id", id),
  updateItem: (data) => ipcRenderer.invoke("update-item", data),
  deleteItem: (id) => ipcRenderer.invoke("delete-item", id),

  // Company operations
  addCompany: (data) => ipcRenderer.invoke("add-company", data),
  getCompany: () => ipcRenderer.invoke("get-company"),
  getCompanyById: (id) => ipcRenderer.invoke("get-company-by-id", id),
  updateCompany: (id, data) => ipcRenderer.invoke("update-company", id, data),
  deleteCompany: (id) => ipcRenderer.invoke("delete-company", id),
  getCompanyImage: (imagePath) =>
    ipcRenderer.invoke("get-company-image", imagePath),

  // Customer operations
  addCustomer: (data) => ipcRenderer.invoke("add-customer", data),
  getCustomer: () => ipcRenderer.invoke("get-customer"),
  getCustomerById: (id) => ipcRenderer.invoke("get-customer-by-id", id),
  updateCustomer: (data) => ipcRenderer.invoke("update-customer", data),
  deleteCustomer: (id) => ipcRenderer.invoke("delete-customer", id),
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

  // Add method to get app paths for debugging
  getPath: (name) => ipcRenderer.invoke("app:getPath", name),

  analytics: {
    debugBasicData: () =>
      ipcRenderer.invoke("analytics:debugBasicData"),

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

    getSmartAlerts: (filters = {}) =>
      ipcRenderer.invoke("analytics:getSmartAlerts", filters),

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

  // 📁 File Management API
  files: {
    // Upload company logo
    uploadLogo: (companyId, fileBuffer, originalName) =>
      ipcRenderer.invoke("files:uploadLogo", { companyId, fileBuffer, originalName }),

    // Upload company signature
    uploadSignature: (companyId, fileBuffer, originalName) =>
      ipcRenderer.invoke("files:uploadSignature", { companyId, fileBuffer, originalName }),

    // Get file information
    getFileInfo: (filename) =>
      ipcRenderer.invoke("files:getFileInfo", filename),

    // Check if file exists
    fileExists: (filename) =>
      ipcRenderer.invoke("files:fileExists", filename),

    // Delete file
    deleteFile: (companyId, type) =>
      ipcRenderer.invoke("files:deleteFile", { companyId, type }),

    // Get company assets (logo and signature URLs)
    getCompanyAssets: (companyId) =>
      ipcRenderer.invoke("files:getCompanyAssets", companyId)
  }
});

// Expose electron-settings API separately for the configuration system
contextBridge.exposeInMainWorld('electronSettings', {
  // Get a setting value
  get: (keyPath) =>
    ipcRenderer.invoke("settings:get", keyPath),

  // Set a setting value
  set: (keyPath, value) =>
    ipcRenderer.invoke("settings:set", keyPath, value),

  // Check if a setting exists
  has: (keyPath) =>
    ipcRenderer.invoke("settings:has", keyPath),

  // Reset settings (keyPath optional, resets all if not provided)
  reset: (keyPath = null) =>
    ipcRenderer.invoke("settings:reset", keyPath),

  // Export all settings
  export: () =>
    ipcRenderer.invoke("settings:export"),

  // Import settings
  import: (settingsData) =>
    ipcRenderer.invoke("settings:import", settingsData),

  // Get all settings
  getAll: () =>
    ipcRenderer.invoke("settings:getAll")
});

// Expose electron-log API for renderer process
contextBridge.exposeInMainWorld('electronLog', {
  // Debug level logging
  debug: (component, message, data = null) =>
    ipcRenderer.invoke("log:debug", component, message, data),

  // Info level logging
  info: (component, message, data = null) =>
    ipcRenderer.invoke("log:info", component, message, data),

  // Warning level logging
  warn: (component, message, data = null) =>
    ipcRenderer.invoke("log:warn", component, message, data),

  // Error level logging
  error: (component, message, error = null, data = null) =>
    ipcRenderer.invoke("log:error", component, message, error, data),

  // Success level logging (mapped to info with success indicator)
  success: (component, message, data = null) =>
    ipcRenderer.invoke("log:success", component, message, data),

  // Get log file paths
  getLogPaths: () =>
    ipcRenderer.invoke("log:getLogPaths"),

  // Read log file content
  readLogFile: (logType = 'main') =>
    ipcRenderer.invoke("log:readLogFile", logType)
});
