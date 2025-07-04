const { ipcMain } = require("electron");
const log = require('electron-log/main');
const DatabaseManager = require("../db/db");
const { companies } = require("../db/schema/Company");
const { eq } = require('drizzle-orm');
const fileService = require("../services/SimpleFileService");

function registerCompanyDashboardIpc() {
  try {
    log.info('Registering Company Dashboard IPC handlers...');
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getDatabase();
    log.debug("Database instance initialized:", !!db);

    // Register the IPC handler to add a company
    ipcMain.handle("add-company", async (event, data) => {
      try {
        log.info("🏢 Starting company creation process for:", data.companyName);
        log.debug("📝 Received company data:", {
          ...data,
          logo: data.logo ? "[LOGO BASE64 DATA]" : "No logo provided",
          signature: data.signature ? "[SIGNATURE BASE64 DATA]" : "No signature provided"
        });

        // First, create the company record to get the ID
        const gstin = data.gstApplicable === true ? data.gstin : null;
        const stateCode = data.gstApplicable === true ? data.stateCode : null;

        log.info("💾 Preparing to insert company data into database...");
        
        // Insert the company data into the database
        const companyData = {
          companyType: data.companyType || "manufacturer",
          companyName: data.companyName,
          currency: data.currency || "inr",
          gstApplicable: data.gstApplicable === true ? "Yes" : "No",
          gstin,
          stateCode,
          country: data.country,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          state: data.state,
          city: data.city,
          email: data.email,
          contactNo: data.contactNo,
          logoFileName: null,
          signatureFileName: null,
          website: data.website || null,
          industry: data.industry || null,
          establishedYear: data.establishedYear ? parseInt(data.establishedYear) : null,
          employeeCount: data.employeeCount ? parseInt(data.employeeCount) : null,
          companySize: data.companySize || null,
          businessModel: data.businessModel || null,
          annualRevenue: data.annualRevenue ? parseInt(data.annualRevenue) : null,
          primaryMarket: data.primaryMarket || null,
          customerSegment: data.customerSegment || null,
          valueProposition: data.valueProposition || null,
          operatingHours: data.operatingHours || null,
          timezone: data.timezone || "Asia/Kolkata",
          fiscalYearStart: data.fiscalYearStart || null,
          taxId: data.taxId || null
        };

        log.debug("📊 Database insert data:", {
          ...companyData,
          // Exclude sensitive or large data from logs
          gstin: gstin ? "XXXX" + gstin.slice(-4) : null
        });

        const result = await db.insert(companies).values(companyData);

        log.info("Company data inserted successfully:", result);

        const companyId = result.lastID || result.id || result.lastInsertRowid;

        log.info("✅ Company record created with ID:", companyId);

        // Now save logo and signature if provided, using the company ID and name
        let logoFileName = null;
        let signatureFileName = null;

        if (data.logo) {
          log.info("🖼️ Processing company logo...");
          try {
            logoFileName = await fileService.saveBase64File(data.logo, companyId, data.companyName, "logo");
            if (logoFileName) {
              log.info("✅ Logo saved successfully:", logoFileName);
              // Update the company record with the logo path
              await db
                .update(companies)
                .set({ logoFileName })
                .where(eq(companies.id, companyId));
            }
          } catch (error) {
            log.error("Error saving logo file:", error);
            log.warn("⚠️ Failed to save logo file");
          }
        }

        if (data.signature) {
          log.info("✍️ Processing company signature...");
          try {
            signatureFileName = await fileService.saveBase64File(data.signature, companyId, data.companyName, "signature");
            if (signatureFileName) {
              log.info("✅ Signature saved successfully:", signatureFileName);
              // Update the company record with the signature path
              await db
                .update(companies)
                .set({ signatureFileName })
                .where(eq(companies.id, companyId));
            }
          } catch (error) {
            log.error("Error saving signature file:", error);
            log.warn("⚠️ Failed to save signature file");
          }
        }

        log.info("🎉 Company creation completed successfully:", {
          name: data.companyName,
          type: data.companyType,
          hasLogo: !!logoFileName,
          hasSignature: !!signatureFileName
        });

        return { 
          success: true, 
          result: {
            ...result,
            id: companyId
          },
          debug: {
            logoSaved: !!logoFileName,
            signatureSaved: !!signatureFileName,
            timestamp: new Date().toISOString()
          }
        };
      } catch (err) {
        log.error("❌ Company creation failed:", {
          error: err.message,
          stack: err.stack,
          companyName: data?.companyName,
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
    log.info("✅ IPC handler 'add-company' registered successfully");

    // Register the IPC handler to get all companies
    ipcMain.handle("get-company", async (event) => {
      try {
        log.debug("📋 Received get-company request");
        const result = await db.select().from(companies);
        log.info(`📊 Retrieved ${result.length} companies from database`);

        // Process each company to add base64 encoded logo/signature
        const companiesWithImages = result.map((company) => {
          // Create a copy of the company object
          const enhancedCompany = { ...company };

          // Add base64 encoded logo if logo filename exists
          if (company.logoFileName) {
            try {
              enhancedCompany.logo = fileService.getBase64File(company.logoFileName);
              log.debug(`✓ Logo loaded for company: ${company.companyName}`);
            } catch (e) {
              log.error(`❌ Error loading logo for company ${company.companyName}:`, e);
            }
          }

          // Add base64 encoded signature if signature filename exists
          if (company.signatureFileName) {
            try {
              enhancedCompany.signature = fileService.getBase64File(company.signatureFileName);
              log.debug(`✓ Signature loaded for company: ${company.companyName}`);
            } catch (e) {
              log.error(`❌ Error loading signature for company ${company.companyName}:`, e);
            }
          }

          return enhancedCompany;
        });

        return { success: true, companies: companiesWithImages };
      } catch (err) {
        log.error("❌ Error fetching companies:", {
          error: err.message,
          stack: err.stack,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'get-company' registered successfully");
  } catch (err) {
    log.error("❌ Error registering Company Dashboard IPC handlers:", {
      error: err.message,
      stack: err.stack,
      errorType: err.name
    });
  }
}

module.exports = { registerCompanyDashboardIpc };
