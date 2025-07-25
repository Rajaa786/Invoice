const { ipcMain } = require("electron");
const log = require('electron-log/main');
const DatabaseManager = require("../db/db");
const { banks } = require("../db/schema/Bank");
const { companies } = require("../db/schema/Company");
const { eq, and, desc } = require('drizzle-orm');
const fileService = require("../services/SimpleFileService");

function registerBankDashboardIpc() {
    try {
        log.info('Registering Bank Dashboard IPC handlers...');
        const dbManager = DatabaseManager.getInstance();
        const db = dbManager.getDatabase();
        log.debug("Database instance initialized:", !!db);

        // Register the IPC handler to add a bank
        ipcMain.handle("add-bank", async (event, data) => {
            try {
                log.info("🏦 Starting bank creation process for:", data.bankName);
                log.debug("📝 Received bank data:", {
                    ...data,
                    accountNumber: data.accountNumber ? "XXXX" + data.accountNumber.slice(-4) : "No account number",
                    ifscCode: data.ifscCode || "No IFSC code"
                });

                // Prepare bank data for insertion (only fields in new schema)
                const bankData = {
                    companyId: data.companyId,
                    bankName: data.bankName,
                    accountNumber: data.accountNumber,
                    ifscCode: data.ifscCode,
                    branchName: data.branchName,
                    accountHolderName: data.accountHolderName,
                    accountType: data.accountType || "savings",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                log.debug("📊 Database insert data:", {
                    ...bankData,
                    accountNumber: "XXXX" + bankData.accountNumber.slice(-4),
                    ifscCode: bankData.ifscCode
                });

                const result = await db.insert(banks).values(bankData);
                const bankId = result.lastID || result.id || result.lastInsertRowid;

                log.info("✅ Bank record created with ID:", bankId);

                return {
                    success: true,
                    result: {
                        ...result,
                        id: bankId
                    },
                    debug: {
                        timestamp: new Date().toISOString()
                    }
                };
            } catch (err) {
                log.error("❌ Bank creation failed:", {
                    error: err.message,
                    stack: err.stack,
                    bankName: data?.bankName,
                    errorType: err.name
                });
                return {
                    success: false,
                    error: err.message,
                    debug: {
                        errorType: err.name,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        });

        // Register the IPC handler to get all banks
        ipcMain.handle("get-banks", async (event, companyId = null) => {
            try {
                log.debug("📋 Received get-banks request", companyId ? `for company: ${companyId}` : "for all companies");

                let result;
                if (companyId) {
                    result = await db.select().from(banks).where(eq(banks.companyId, companyId)).orderBy(desc(banks.createdAt));
                } else {
                    result = await db.select().from(banks).orderBy(desc(banks.createdAt));
                }

                log.info(`📊 Retrieved ${result.length} banks from database`);

                // Process each bank to add base64 encoded files
                const banksWithFiles = result.map((bank) => {
                    const enhancedBank = { ...bank };

                    // Convert paise back to rupees for display
                    enhancedBank.openingBalance = bank.openingBalance ? bank.openingBalance / 100 : 0;
                    enhancedBank.currentBalance = bank.currentBalance ? bank.currentBalance / 100 : 0;
                    enhancedBank.interestRate = bank.interestRate ? bank.interestRate / 100 : null;
                    enhancedBank.dailyTransactionLimit = bank.dailyTransactionLimit ? bank.dailyTransactionLimit / 100 : null;
                    enhancedBank.monthlyTransactionLimit = bank.monthlyTransactionLimit ? bank.monthlyTransactionLimit / 100 : null;
                    enhancedBank.singleTransactionLimit = bank.singleTransactionLimit ? bank.singleTransactionLimit / 100 : null;
                    enhancedBank.overdraftLimit = bank.overdraftLimit ? bank.overdraftLimit / 100 : null;

                    // Add base64 encoded files if they exist
                    if (bank.passbookFileName) {
                        try {
                            enhancedBank.passbookFile = fileService.getBase64File(bank.passbookFileName);
                            log.debug(`✓ Passbook loaded for bank: ${bank.bankName}`);
                        } catch (e) {
                            log.error(`❌ Error loading passbook for bank ${bank.bankName}:`, e);
                        }
                    }

                    if (bank.bankStatementFileName) {
                        try {
                            enhancedBank.bankStatementFile = fileService.getBase64File(bank.bankStatementFileName);
                            log.debug(`✓ Bank statement loaded for bank: ${bank.bankName}`);
                        } catch (e) {
                            log.error(`❌ Error loading bank statement for bank ${bank.bankName}:`, e);
                        }
                    }

                    if (bank.kycDocumentsFileName) {
                        try {
                            enhancedBank.kycDocumentsFile = fileService.getBase64File(bank.kycDocumentsFileName);
                            log.debug(`✓ KYC documents loaded for bank: ${bank.bankName}`);
                        } catch (e) {
                            log.error(`❌ Error loading KYC documents for bank ${bank.bankName}:`, e);
                        }
                    }

                    return enhancedBank;
                });

                return { success: true, banks: banksWithFiles };
            } catch (err) {
                log.error("❌ Error fetching banks:", {
                    error: err.message,
                    stack: err.stack,
                    errorType: err.name
                });
                return { success: false, error: err.message };
            }
        });

        // Register the IPC handler to get a specific bank
        ipcMain.handle("get-bank", async (event, bankId) => {
            try {
                log.debug("📋 Received get-bank request for ID:", bankId);
                const result = await db.select().from(banks).where(eq(banks.id, bankId));

                if (result.length === 0) {
                    return { success: false, error: "Bank not found" };
                }

                const bank = result[0];
                const enhancedBank = { ...bank };

                // Convert paise back to rupees for display
                enhancedBank.openingBalance = bank.openingBalance ? bank.openingBalance / 100 : 0;
                enhancedBank.currentBalance = bank.currentBalance ? bank.currentBalance / 100 : 0;
                enhancedBank.interestRate = bank.interestRate ? bank.interestRate / 100 : null;
                enhancedBank.dailyTransactionLimit = bank.dailyTransactionLimit ? bank.dailyTransactionLimit / 100 : null;
                enhancedBank.monthlyTransactionLimit = bank.monthlyTransactionLimit ? bank.monthlyTransactionLimit / 100 : null;
                enhancedBank.singleTransactionLimit = bank.singleTransactionLimit ? bank.singleTransactionLimit / 100 : null;
                enhancedBank.overdraftLimit = bank.overdraftLimit ? bank.overdraftLimit / 100 : null;

                // Add base64 encoded files if they exist
                if (bank.passbookFileName) {
                    try {
                        enhancedBank.passbookFile = fileService.getBase64File(bank.passbookFileName);
                    } catch (e) {
                        log.error(`❌ Error loading passbook for bank ${bank.bankName}:`, e);
                    }
                }

                if (bank.bankStatementFileName) {
                    try {
                        enhancedBank.bankStatementFile = fileService.getBase64File(bank.bankStatementFileName);
                    } catch (e) {
                        log.error(`❌ Error loading bank statement for bank ${bank.bankName}:`, e);
                    }
                }

                if (bank.kycDocumentsFileName) {
                    try {
                        enhancedBank.kycDocumentsFile = fileService.getBase64File(bank.kycDocumentsFileName);
                    } catch (e) {
                        log.error(`❌ Error loading KYC documents for bank ${bank.bankName}:`, e);
                    }
                }

                return { success: true, bank: enhancedBank };
            } catch (err) {
                log.error("❌ Error fetching bank:", {
                    error: err.message,
                    stack: err.stack,
                    bankId,
                    errorType: err.name
                });
                return { success: false, error: err.message };
            }
        });

        // Register the IPC handler to update a bank
        ipcMain.handle("update-bank", async (event, { bankId, data }) => {
            try {
                log.info("🔄 Starting bank update process for ID:", bankId);
                log.debug("📝 Received update data:", {
                    ...data,
                    accountNumber: data.accountNumber ? "XXXX" + data.accountNumber.slice(-4) : "No account number"
                });

                // Prepare update data (only fields in new schema)
                const updateData = {
                    bankName: data.bankName,
                    accountNumber: data.accountNumber,
                    ifscCode: data.ifscCode,
                    branchName: data.branchName,
                    accountHolderName: data.accountHolderName,
                    accountType: data.accountType || "savings",
                    updatedAt: new Date(),
                };

                const result = await db.update(banks).set(updateData).where(eq(banks.id, bankId));

                log.info("✅ Bank updated successfully:", bankId);

                return {
                    success: true,
                    result,
                    debug: {
                        timestamp: new Date().toISOString()
                    }
                };
            } catch (err) {
                log.error("❌ Bank update failed:", {
                    error: err.message,
                    stack: err.stack,
                    bankId,
                    errorType: err.name
                });
                return {
                    success: false,
                    error: err.message,
                    debug: {
                        errorType: err.name,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        });

        // Register the IPC handler to delete a bank
        ipcMain.handle("delete-bank", async (event, bankId) => {
            try {
                log.info("🗑️ Starting bank deletion process for ID:", bankId);

                const result = await db.delete(banks).where(eq(banks.id, bankId));

                log.info("✅ Bank deleted successfully:", bankId);

                return {
                    success: true,
                    result,
                    debug: {
                        timestamp: new Date().toISOString()
                    }
                };
            } catch (err) {
                log.error("❌ Bank deletion failed:", {
                    error: err.message,
                    stack: err.stack,
                    bankId,
                    errorType: err.name
                });
                return {
                    success: false,
                    error: err.message,
                    debug: {
                        errorType: err.name,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        });

        // Register the IPC handler to get banks by company
        ipcMain.handle("get-company-banks", async (event, companyId) => {
            try {
                log.debug("📋 Received get-company-banks request for company:", companyId);

                const result = await db.select().from(banks).where(eq(banks.companyId, companyId)).orderBy(desc(banks.createdAt));

                log.info(`📊 Retrieved ${result.length} banks for company ${companyId}`);

                const banksWithFiles = result.map((bank) => {
                    const enhancedBank = { ...bank };

                    // Convert paise back to rupees for display
                    enhancedBank.openingBalance = bank.openingBalance ? bank.openingBalance / 100 : 0;
                    enhancedBank.currentBalance = bank.currentBalance ? bank.currentBalance / 100 : 0;
                    enhancedBank.interestRate = bank.interestRate ? bank.interestRate / 100 : null;
                    enhancedBank.dailyTransactionLimit = bank.dailyTransactionLimit ? bank.dailyTransactionLimit / 100 : null;
                    enhancedBank.monthlyTransactionLimit = bank.monthlyTransactionLimit ? bank.monthlyTransactionLimit / 100 : null;
                    enhancedBank.singleTransactionLimit = bank.singleTransactionLimit ? bank.singleTransactionLimit / 100 : null;
                    enhancedBank.overdraftLimit = bank.overdraftLimit ? bank.overdraftLimit / 100 : null;

                    return enhancedBank;
                });

                return { success: true, banks: banksWithFiles };
            } catch (err) {
                log.error("❌ Error fetching company banks:", {
                    error: err.message,
                    stack: err.stack,
                    companyId,
                    errorType: err.name
                });
                return { success: false, error: err.message };
            }
        });

        // Register the IPC handler to set default bank
        ipcMain.handle("set-default-bank", async (event, { companyId, bankId }) => {
            try {
                log.info("⭐ Setting default bank for company:", companyId, "bank:", bankId);

                // First, unset all default banks for this company
                await db.update(banks).set({ isDefault: false }).where(eq(banks.companyId, companyId));

                // Then set the specified bank as default
                const result = await db.update(banks).set({ isDefault: true }).where(eq(banks.id, bankId));

                log.info("✅ Default bank set successfully");

                return {
                    success: true,
                    result,
                    debug: {
                        timestamp: new Date().toISOString()
                    }
                };
            } catch (err) {
                log.error("❌ Setting default bank failed:", {
                    error: err.message,
                    stack: err.stack,
                    companyId,
                    bankId,
                    errorType: err.name
                });
                return {
                    success: false,
                    error: err.message,
                    debug: {
                        errorType: err.name,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        });

        log.info("✅ All Bank Dashboard IPC handlers registered successfully");
    } catch (error) {
        log.error("❌ Failed to register Bank Dashboard IPC handlers:", error);
        throw error;
    }
}

module.exports = { registerBankDashboardIpc }; 