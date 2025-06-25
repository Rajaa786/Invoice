const { ipcMain } = require("electron");
const log = require('electron-log/main');
const DatabaseManager = require("../db/db");
const { companies } = require("../db/schema/Company");
const path = require("path");
const fs = require("fs");

function registerCompanyDashboardIpc() {
  try {
    log.info('Registering Company Dashboard IPC handlers...');
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getDatabase();
    log.debug("Database instance initialized:", !!db);

    // Import tmpDir from main.js
    const { tmpDir } = require("../main");

    // Helper function to save files to tmp directory
    const saveFileToCompanyTmpFolder = (base64Data, companyName, type) => {
      if (!base64Data || typeof base64Data !== "string") {
        log.warn(`${type} data is invalid or not a base64 string.`);
        return null;
      }

      // Parse the base64 string
      const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const fileExtension = matches[1].split("/")[1];
        const data = matches[2];
        const fileBuffer = Buffer.from(data, "base64");

        // Create a sanitized company folder name
        const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, "_");
        const companyFolder = path.join(tmpDir, sanitizedCompanyName);

        // Create directory if it doesn't exist
        if (!fs.existsSync(companyFolder)) {
          fs.mkdirSync(companyFolder, { recursive: true });
        }

        // Create a unique filename
        const fileName = `${type}_${Date.now()}.${fileExtension}`;
        const filePath = path.join(companyFolder, fileName);

        // Write the file
        fs.writeFileSync(filePath, fileBuffer);
        log.info(`${type} saved at: ${filePath}`);

        return filePath;
      }

      log.warn(`Invalid base64 format for ${type}`);
      return null;
    };

    // Register the IPC handler to add a company
    ipcMain.handle("add-company", async (event, data) => {
      try {
        log.info("Received add-company request for:", data.companyName);
        log.debug("Company data:", {
          ...data,
          logo: data.logo ? "[LOGO DATA]" : null,
          signature: data.signature ? "[SIGNATURE DATA]" : null,
        });

        // Save logo and signature if provided
        const logoPath = data.logo
          ? saveFileToCompanyTmpFolder(data.logo, data.companyName, "logo")
          : null;

        const signaturePath = data.signature
          ? saveFileToCompanyTmpFolder(
            data.signature,
            data.companyName,
            "signature"
          )
          : null;

        const gstin = data.gstApplicable === true ? data.gstin : null;
        const stateCode = data.gstApplicable === true ? data.stateCode : null;

        // Insert the company data into the database
        const result = await db.insert(companies).values({
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
          logoPath,
          signaturePath,
        });

        log.info(`Company '${data.companyName}' added successfully`);
        return { success: true, result };
      } catch (err) {
        log.error("Company insert error:", err);
        return { success: false, error: err.message };
      }
    });
    log.info("IPC handler 'add-company' registered successfully");

    // Add an IPC handler to get company images
    ipcMain.handle("get-company-image", async (event, imagePath) => {
      try {
        if (!imagePath || !fs.existsSync(imagePath)) {
          return { success: false, error: "Image not found" };
        }

        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");

        // Determine the MIME type based on the file extension
        const ext = path.extname(imagePath).toLowerCase().substring(1);
        let mimeType = "image/jpeg"; // Default to JPEG

        if (ext === "png") {
          mimeType = "image/png";
        } else if (ext === "gif") {
          mimeType = "image/gif";
        } else if (ext === "svg") {
          mimeType = "image/svg+xml";
        }

        log.debug(`Company image retrieved successfully: ${imagePath}`);
        return {
          success: true,
          data: `data:${mimeType};base64,${base64Image}`,
        };
      } catch (err) {
        log.error("Get company image error:", err);
        return { success: false, error: err.message };
      }
    });
    log.info("IPC handler 'get-company-image' registered successfully");

    // Register the IPC handler to get all companies
    ipcMain.handle("get-company", async (event) => {
      try {
        log.debug("Received get-company request");
        const result = await db.select().from(companies);
        log.info(`Retrieved ${result.length} companies from database`);

        // Process each company to add base64 encoded logo/signature
        const companiesWithImages = await Promise.all(
          result.map(async (company) => {
            // Create a copy of the company object
            const enhancedCompany = { ...company };

            // Add base64 encoded logo if logo path exists
            if (company.logoPath && fs.existsSync(company.logoPath)) {
              try {
                const logoBuffer = fs.readFileSync(company.logoPath);
                const ext = path
                  .extname(company.logoPath)
                  .toLowerCase()
                  .substring(1);
                let mimeType =
                  ext === "png"
                    ? "image/png"
                    : ext === "svg"
                      ? "image/svg+xml"
                      : ext === "gif"
                        ? "image/gif"
                        : "image/jpeg";

                enhancedCompany.logo = `data:${mimeType};base64,${logoBuffer.toString(
                  "base64"
                )}`;
              } catch (e) {
                log.error("Error loading company logo:", e);
              }
            }

            // Add base64 encoded signature if signature path exists
            if (company.signaturePath && fs.existsSync(company.signaturePath)) {
              try {
                const sigBuffer = fs.readFileSync(company.signaturePath);
                const ext = path
                  .extname(company.signaturePath)
                  .toLowerCase()
                  .substring(1);
                let mimeType =
                  ext === "png"
                    ? "image/png"
                    : ext === "svg"
                      ? "image/svg+xml"
                      : ext === "gif"
                        ? "image/gif"
                        : "image/jpeg";

                enhancedCompany.signature = `data:${mimeType};base64,${sigBuffer.toString(
                  "base64"
                )}`;
              } catch (e) {
                log.error("Error loading company signature:", e);
              }
            }

            return enhancedCompany;
          })
        );

        log.debug(`Processed ${companiesWithImages.length} companies with images`);
        return { success: true, companies: companiesWithImages };
      } catch (err) {
        log.error("Get company error:", err);
        return { success: false, error: err.message };
      }
    });
    log.info("IPC handler 'get-company' registered successfully");
    log.info("Company Dashboard IPC handlers registration completed");
  } catch (err) {
    log.error("Failed to initialize company dashboard IPC:", err);
  }
}

module.exports = { registerCompanyDashboardIpc };
