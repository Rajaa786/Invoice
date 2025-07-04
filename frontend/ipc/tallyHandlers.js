const { ipcMain } = require("electron");
const log = require("electron-log");
const databaseManager = require("../db/db");
const { eq, inArray, and } = require("drizzle-orm");
const { statements } = require("../db/schema/Statement");
const { transactions } = require("../db/schema/Transactions");
const axios = require("axios");
const {
  buildTallyXmlPayment,
  buildTallyXmlReceipt,
  buildTallyXmlContra,
  buildTallyPrimeLedgerXml,
  buildTallyERPLedgerXml,
  buildSalesXml,
} = require("./utils/buildTallyXml");
const { fetchLedgersForAllCompanies } = require("./utils/getComapnyAndLedgers");

const { XMLParser } = require("fast-xml-parser");
const { tallyVoucher } = require("../db/schema/TallyVoucher");
const { tallySalesVoucher } = require("../db/schema/TallySalesVoucher");
const { invoices } = require("../db/schema/Invoice");

function registerTallyIpc() {
  const db = databaseManager.getInstance().getDatabase();
  // log.info("Database instance : ", db);

  ipcMain.handle(
    "get-tally-voucher-transactions",
    async (event, caseId, voucherType) => {
      log.info({ caseId, voucherType });
      try {
        const allStatements = await db
          .select()
          .from(statements)
          .where(eq(statements.caseId, caseId));

        if (allStatements.length === 0) {
          log.info("No statements found for case:", caseId);
          return [];
        }

        // Determine the voucher types based on the incoming string
        let voucherTypesFilter = [];
        if (
          voucherType.includes("Payment") &&
          voucherType.includes("Receipt")
        ) {
          voucherTypesFilter = ["Payment", "Receipt"];
        } else if (voucherType.includes("Contra")) {
          voucherTypesFilter = ["Contra"];
        } else {
          voucherTypesFilter = [voucherType.replace(" Voucher", "")];
        }

        // Combine the conditions using the and() helper so both are applied
        const allTransactions = await db
          .select({
            id: transactions.id,
            ...transactions,
          })
          .from(transactions)
          .where(
            and(
              inArray(
                transactions.statementId,
                allStatements.map((stmt) => stmt.id.toString())
              ),
              inArray(transactions.voucher_type, voucherTypesFilter)
            )
          );

        return allTransactions;
      } catch (error) {
        console.error("Error fetching opportunity data:", error);
        return null;
      }
    }
  );

  // create a new ipc handler to update the status of the transactions
  ipcMain.handle("update-transaction-status", async (event, transactionIds) => {
    try {
      const updatedTransactions = await db
        .update(transactions)
        .set({ imported: 1 })
        .where(inArray(transactions.id, transactionIds));
      return true;
    } catch (error) {
      console.error("Error updating transaction status:", error);
      return false;
    }
  });

  ipcMain.handle("tally-upload", async (event, tallyUploadData, port) => {
    const successIds = [];
    const failedTransactions = [];
    const parser = new XMLParser(); // XML Parser for response

    log.info({ tallyUploadData, port });
    const end = tallyUploadData.length;
    const tallyPath = `http://localhost:${port}`;
    log.info({ tallyPath });
    // const end = 2;
    for (let i = 0; i < end; i++) {
      const row = tallyUploadData[i];
      const voucherName = row.voucherName;
      // const isContra = voucherName === "Contra";
      let xmlContent = null;
      // console.log({ row });
      // tallyUploadData[i].invoiceDate = "20220401"; // Hardcoded date for now

      if (voucherName === "Payment") {
        xmlContent = buildTallyXmlPayment(row);
      } else if (voucherName === "Receipt") {
        xmlContent = buildTallyXmlReceipt(row);
      } else if (voucherName === "Contra") {
        xmlContent = buildTallyXmlContra(row);
      }

      // log.info({ xmlContent });

      try {
        const response = await axios.post(tallyPath, xmlContent, {
          headers: { "Content-Type": "application/xml" },
        });
        const xmlResponse = response.data;
        const parsedResponse = parser.parse(xmlResponse);
        // log.info({ parsedResponse });
        const lineError = parsedResponse.RESPONSE?.LINEERROR || null;

        if (lineError) {
          console.error(`Transaction ${row.id} Failed: ${lineError}`);
          log.info({ xmlContent });

          failedTransactions.push({ id: row.id, error: lineError });
        } else {
          console.log(`Transaction ${row.id} Successful`);
          successIds.push(row.id);
        }
      } catch (error) {
        console.error(
          `Transaction ${row.id} Failed (Server Error): ${error.message}`
        );
        log.info({ xmlContent });

        if (error.message == "") {
          failedTransactions.push({
            id: row.id,
            error: "Please check Port number and Company name",
          });
        } else {
          failedTransactions.push({ id: row.id, error: error.message });
        }
      }
    }

    // Outside for loop
    // Call backend API to update success statuses
    if (successIds.length > 0) {
      // const updateResult = await ipcRenderer.invoke("update-transaction-status", successIds);
      try {
        const updatedTransactions = await db
          .update(transactions)
          .set({ imported: 1 })
          .where(inArray(transactions.id, successIds));
      } catch (error) {
        console.error("Error updating transaction status:", error);
      }
    }

    log.info({ successIds, failedTransactions });

    return { success: true, successIds, failedTransactions };
  });

  ipcMain.handle(
    "ledger-create",
    async (event, tallyUploadData, port, tallyVersion) => {
      const successIds = [];
      const failedTransactions = [];
      const parser = new XMLParser(); // XML Parser for response

      log.info({ tallyUploadData });
      const end = tallyUploadData.length;

      // const end = 2;
      const isPrime = tallyVersion === "TallyPrime";
      for (let i = 0; i < end; i++) {
        const row = tallyUploadData[i];
        // tallyUploadData[i].date = "20250401"; // Hardcoded date for now

        const xmlContent = isPrime
          ? buildTallyPrimeLedgerXml(row)
          : buildTallyERPLedgerXml(row);
        // const xmlContent = buildTallyLedgerXml(row);

        try {
          const response = await axios.post(
            `http://localhost:${[port]}`,
            xmlContent,
            {
              headers: { "Content-Type": "application/xml" },
            }
          );
          const xmlResponse = response.data;
          const parsedResponse = parser.parse(xmlResponse);
          const lineError = parsedResponse.RESPONSE?.LINEERROR || null;

          if (lineError) {
            console.error(`Transaction ${row.id} Failed: ${lineError}`);
            failedTransactions.push({ [row.id]: lineError });
            console.log({ xmlContent });
          } else {
            console.log(`Transaction ${row.id} Successful`);
            successIds.push(row.id);
          }
        } catch (error) {
          console.error(
            `Transaction ${row.id} Failed (Server Error): ${error.message}`
          );
          console.log({ xmlContent });
          failedTransactions.push({ id: row.id, error: error.message });
        }
      }

      // Outside for loop
      // Call backend API to update success statuses
      if (successIds.length > 0) {
        // const updateResult = await ipcRenderer.invoke("update-transaction-status", successIds);
        try {
          const updatedTransactions = await db
            .update(transactions)
            .set({ imported: 1 })
            .where(inArray(transactions.id, successIds));
        } catch (error) {
          console.error("Error updating transaction status:", error);
        }
      }

      log.info({ successIds, failedTransactions });

      return { success: true, successIds, failedTransactions };
    }
  );

  ipcMain.handle("import-ledgers", async (event, companyName, port) => {
    log.info({ companyName, port });

    try {
      const response = await fetchLedgersForAllCompanies(port);

      console.log({ response });

      // const response = await fetchLedgerData(companyName);

      const ledgers = response;
      return { success: true, ledgerData: ledgers };
    } catch (error) {
      console.error(`Ledger Import Failed (Server Error): ${error.message}`);
      return { success: false, error: error.message };
    }
  });

  // check-tally-running
  ipcMain.handle("check-tally-running", async (event, port) => {
    log.info({ port });

    try {
      const response = await axios.get(`http://localhost:${port}`);
      log.info({ response });
      return { success: true };
    } catch (error) {
      log.error({ error });
      return { success: false };
    }
  });

  ipcMain.handle(
    "store-tally-upload",
    async (event, uploadResponse, bankLedger, uploadData) => {
      try {
        // Check what type of data we're dealing with
        const transactionIds = uploadData.map(t => t.id);
        
        // First check if these are transaction IDs
        const existingTransactions = await db
          .select({ id: transactions.id })
          .from(transactions)
          .where(inArray(transactions.id, transactionIds));

        const existingTransactionIds = new Set(existingTransactions.map(t => t.id));
        
        // If no transaction IDs found, check if these are invoice IDs
        let existingInvoiceIds = new Set();
        if (existingTransactionIds.size === 0) {
          // Check if the IDs match invoice IDs (they might be string IDs like '1751631526542-0')
          // For now, let's extract the numeric part and check if they exist as invoice IDs
          const numericIds = transactionIds.map(id => {
            // Extract numeric part from IDs like '1751631526542-0'
            const match = String(id).match(/^(\d+)/);
            return match ? parseInt(match[1]) : null;
          }).filter(id => id !== null);

          if (numericIds.length > 0) {
            const existingInvoices = await db
              .select({ id: invoices.id })
              .from(invoices)
              .where(inArray(invoices.id, numericIds));
            
            existingInvoiceIds = new Set(existingInvoices.map(inv => inv.id));
          }
        }

        // Determine data type and process accordingly
        if (existingTransactionIds.size > 0) {
          // This is transaction data - store in tallyVoucher table
          console.log("Processing transaction data for tallyVoucher table");
          
          const validUploadData = uploadData.filter(item => existingTransactionIds.has(item.id));
          const missingIds = transactionIds.filter(id => !existingTransactionIds.has(id));

          if (missingIds.length > 0) {
            console.log(`Warning: Some transaction IDs not found: ${missingIds.join(', ')}`);
          }

          if (validUploadData.length === 0) {
            return {
              success: false,
              error: `No valid transaction IDs found in database`
            };
          }

          // Prepare transaction records for tallyVoucher table
          const insertRecords = validUploadData.map((transaction) => {
            const isSuccessful = uploadResponse.successIds.includes(transaction.id);

            return {
              transactionId: transaction.id,
              effective_date: transaction.effectiveDate
                ? new Date(transaction.effectiveDate)
                : new Date(),
              bill_reference: transaction.billRefernce || "",
              failed_reason: isSuccessful
                ? ""
                : JSON.stringify(
                  uploadResponse.failedTransactions.find(
                    (failed) => failed.id === transaction.id
                  ) || "Unknown failure"
                ),
              bank_ledger: bankLedger || "",
              result: isSuccessful ? 1 : 0,
              createdAt: new Date(),
            };
          });

          // Insert transaction records
          const insertedRecords = [];
          for (const record of insertRecords) {
            const inserted = await db
              .insert(tallyVoucher)
              .values(record)
              .returning();
            insertedRecords.push(inserted[0]);
          }

          return {
            success: true,
            insertedRecords: insertedRecords,
            skippedRecords: missingIds.length,
            dataType: 'transactions'
          };

        } else if (existingInvoiceIds.size > 0) {
          // This is sales/invoice data - store in tallySalesVoucher table
          console.log("Processing sales/invoice data for tallySalesVoucher table");
          
          // Map upload data to invoice IDs
          const salesRecords = uploadData.map((salesItem) => {
            // Extract numeric part from IDs like '1751631526542-0'
            const match = String(salesItem.id).match(/^(\d+)/);
            const invoiceId = match ? parseInt(match[1]) : null;
            
            if (!invoiceId || !existingInvoiceIds.has(invoiceId)) {
              return null; // Skip invalid invoice IDs
            }

            const isSuccessful = uploadResponse.successIds.includes(salesItem.id);

            return {
              invoiceId: invoiceId,
              effective_date: salesItem.effectiveDate
                ? new Date(salesItem.effectiveDate)
                : new Date(),
              voucher_number: salesItem.VoucherNumber || salesItem.voucherNumber || "",
              failed_reason: isSuccessful
                ? ""
                : JSON.stringify(
                  uploadResponse.failedTransactions.find(
                    (failed) => failed.id === salesItem.id
                  ) || "Unknown failure"
                ),
              result: isSuccessful ? 1 : 0,
              createdAt: new Date(),
            };
          }).filter(record => record !== null);

          if (salesRecords.length === 0) {
            return {
              success: false,
              error: `No valid invoice IDs found for sales data`
            };
          }

          // Insert sales records
          const insertedSalesRecords = [];
          for (const record of salesRecords) {
            const inserted = await db
              .insert(tallySalesVoucher)
              .values(record)
              .returning();
            insertedSalesRecords.push(inserted[0]);
          }

          return {
            success: true,
            insertedRecords: insertedSalesRecords,
            skippedRecords: uploadData.length - salesRecords.length,
            dataType: 'sales'
          };

        } else {
          // No matching IDs found in either table
          console.log("No matching transaction or invoice IDs found.");
          return {
            success: false,
            error: "No matching transaction or invoice IDs found in database"
          };
        }

      } catch (error) {
        console.error("Error storing Tally upload:", error);
        return {
          success: false,
          error: error.message,
        };
      }
    }
  );

  ipcMain.handle(
    "get-tally-transactions",
    async (event, caseId, individualId) => {
      try {
        let allTransactions = [];

        // Get all transactions based on caseId or individualId
        if (individualId) {
          console.log("individualId", individualId);
          allTransactions = await db
            .select({
              id: transactions.id,
              ...transactions,
            })
            .from(transactions)
            .where(and(eq(transactions.statementId, individualId.toString())));

          log.info({ allTransactions: allTransactions.length });
        } else {
          const allStatements = await db
            .select()
            .from(statements)
            .where(eq(statements.caseId, caseId));

          if (allStatements.length === 0) {
            log.info("No statements found for case:", caseId);
            return [];
          }

          allTransactions = await db
            .select({
              id: transactions.id,
              ...transactions,
            })
            .from(transactions)
            .where(
              inArray(
                transactions.statementId,
                allStatements.map((stmt) => stmt.id.toString())
              )
            );
        }

        // Join with the tally_voucher table to get upload status information
        const transactionsWithTallyStatus = await Promise.all(
          allTransactions.map(async (transaction) => {
            // Query the tally_voucher table for this transaction
            const tallyData = await db
              .select()
              .from(tallyVoucher)
              .where(eq(tallyVoucher.transactionId, transaction.id))
              .limit(1);

            // Determine if the transaction was successfully uploaded to Tally
            const isImported =
              tallyData.length > 0 && tallyData[0].result === true;
            const failedReason =
              tallyData.length > 0 ? tallyData[0].failed_reason : "";
            const bankLedger =
              tallyData.length > 0 ? tallyData[0].bank_ledger : "";
            const effective_date =
              tallyData.length > 0 ? tallyData[0].effective_date : null;
            const bill_reference =
              tallyData.length > 0 ? tallyData[0].bill_reference : "";

            // Return transaction with the additional Tally status info
            return {
              ...transaction,
              imported: isImported ? 1 : 0,
              failed_reason: failedReason,
              bank_ledger: bankLedger,
              effective_date: effective_date
                ? new Date(effective_date).toISOString()
                : "",
              bill_reference: bill_reference,
            };
          })
        );

        // log.info("transactionsWithTallyStatus", transactionsWithTallyStatus);

        return transactionsWithTallyStatus;
      } catch (error) {
        log.error("Error fetching transactions with Tally status:", error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    "sales-create",
    async (event, tallyUploadData, port) => {
      const successIds = [];
      const failedTransactions = [];
      const parser = new XMLParser(); // XML Parser for response

      log.info({ port, tallyUploadData });
      const end = tallyUploadData.length;

      // const end = 2;
      // const isPrime = tallyVersion === "TallyPrime";
      for (let i = 0; i < end; i++) {
        const row = tallyUploadData[i];
        log.info({ row })
        tallyUploadData[i].invoiceDate = "20250401"; // Hardcoded date for now
        tallyUploadData[i].effectiveDate = "20250401"; // Hardcoded date for now

        const xmlContent = buildSalesXml(row);
        log.info({ xmlContent })
        // const xmlContent = isPrime
        //   ? buildTallyPrimeSalesXml(row)
        //   : buildTallyERPSalesXml(row);
        // const xmlContent = buildTallyLedgerXml(row);

        try {
          const response = await axios.post(
            `http://localhost:${[port]}`,
            xmlContent,
            {
              headers: { "Content-Type": "application/xml" },
            }
          );
          const xmlResponse = response.data;
          const parsedResponse = parser.parse(xmlResponse);
          const lineError = parsedResponse.RESPONSE?.LINEERROR || null;

          if (lineError) {
            console.error(`Transaction ${row.id} Failed: ${lineError}`);
            failedTransactions.push({ [row.id]: lineError });
            console.log({ xmlContent });
          } else {
            console.log(`Transaction ${row.id} Successful`);
            successIds.push(row.id);
          }
        } catch (error) {
          console.error(
            `Transaction ${row.id} Failed (Server Error): ${error.message}`
          );
          console.log({ xmlContent });
          failedTransactions.push({ id: row.id, error: error.message });
        }
      }

      // Outside for loop
      // Call backend API to update success statuses
      if (successIds.length > 0) {
        // const updateResult = await ipcRenderer.invoke("update-transaction-status", successIds);
        try {
          const updatedTransactions = await db
            .update(transactions)
            .set({ imported: 1 })
            .where(inArray(transactions.id, successIds));
        } catch (error) {
          console.error("Error updating transaction status:", error);
        }
      }

      log.info({ successIds, failedTransactions });

      return { success: true, successIds, failedTransactions };
    }
  );
}

module.exports = { registerTallyIpc };
