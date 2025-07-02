const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Path to the database
const dbPath = path.join(__dirname, './db.sqlite3');

// Path to the dummy data
const dummyDataDir = path.join(__dirname, './dummy-data');

// Check if dummy data exists
if (!fs.existsSync(dummyDataDir)) {
    console.error('❌ Dummy data directory not found. Please run test-dummy-data-generator.js first.');
    process.exit(1);
}

// Check if database exists
if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found:', dbPath);
    process.exit(1);
}

// Helper function to convert camelCase to snake_case
function camelToSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Helper function to map object keys from camelCase to snake_case
function mapObjectKeys(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[camelToSnakeCase(key)] = value;
    }
    return result;
}

try {
    console.log('🔄 Connecting to database...');

    // Connect to the database
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error connecting to database:', err.message);
            process.exit(1);
        }
        console.log('✅ Connected to database:', dbPath);

        // Load dummy data
        console.log('📂 Loading dummy data...');

        const companiesData = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'companies.json'), 'utf8'));
        const itemsData = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'items.json'), 'utf8'));
        const customersData = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'customers.json'), 'utf8'));

        console.log(`📊 Found ${companiesData.length} companies, ${itemsData.length} items, and ${customersData.length} customers`);

        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON', function (err) {
            if (err) {
                console.error('❌ Error enabling foreign keys:', err.message);
                return;
            }

            // Start transaction
            db.run('BEGIN TRANSACTION', function (err) {
                if (err) {
                    console.error('❌ Error starting transaction:', err.message);
                    return;
                }

                // Import companies
                console.log('🏢 Importing companies...');

                let companiesImported = 0;
                let companiesErrors = 0;

                for (const company of companiesData) {
                    // Remove ID as it will be auto-generated
                    const { id, ...companyData } = company;

                    // Map specific fields that need special handling
                    const mappedData = {
                        company_type: companyData.companyType,
                        company_name: companyData.companyName,
                        currency: companyData.currency,
                        gst_applicable: companyData.gstApplicable,
                        gstin: companyData.gstin,
                        state_code: companyData.stateCode,
                        country: companyData.country,
                        address_line_1: companyData.addressLine1,
                        address_line_2: companyData.addressLine2,
                        state: companyData.state,
                        city: companyData.city,
                        email: companyData.email,
                        contact_no: companyData.contactNo,
                        logo_path: companyData.logoPath,
                        signature_path: companyData.signaturePath,
                        established_year: companyData.establishedYear,
                        employee_count: companyData.employeeCount,
                        website: companyData.website,
                        industry: companyData.industry,
                        annual_revenue: companyData.annualRevenue,
                        business_model: companyData.businessModel,
                        company_size: companyData.companySize,
                        primary_market: companyData.primaryMarket,
                        customer_segment: companyData.customerSegment,
                        value_proposition: companyData.valueProposition,
                        operating_hours: companyData.operatingHours,
                        timezone: companyData.timezone,
                        linkedin_url: companyData.linkedinUrl,
                        facebook_url: companyData.facebookUrl,
                        twitter_url: companyData.twitterUrl,
                        fiscal_year_start: companyData.fiscalYearStart,
                        tax_id: companyData.taxId,
                        certifications: companyData.certifications,
                        compliance_standards: companyData.complianceStandards
                    };

                    // Create placeholders and values array
                    const keys = Object.keys(mappedData);
                    const values = Object.values(mappedData);
                    const placeholders = keys.map(() => '?').join(', ');

                    const sql = `INSERT INTO companies (${keys.join(', ')}) VALUES (${placeholders})`;

                    db.run(sql, values, function (err) {
                        if (err) {
                            console.error(`❌ Error importing company ${companyData.companyName}:`, err.message);
                            companiesErrors++;
                        } else {
                            companiesImported++;
                        }

                        // Check if all companies have been processed
                        if (companiesImported + companiesErrors === companiesData.length) {
                            console.log(`✅ Successfully imported ${companiesImported} companies (${companiesErrors} errors)`);

                            // Import items
                            importItems();
                        }
                    });
                }

                // Import items function
                function importItems() {
                    console.log('📦 Importing items...');

                    let itemsImported = 0;
                    let itemsErrors = 0;

                    for (const item of itemsData) {
                        // Remove ID as it will be auto-generated
                        const { id, ...itemData } = item;

                        // Map specific fields that need special handling
                        const mappedData = {
                            type: itemData.type,
                            name: itemData.name,
                            hsn_sac_code: itemData.hsnSacCode,
                            unit: itemData.unit,
                            selling_price: itemData.sellingPrice,
                            currency: itemData.currency,
                            description: itemData.description
                        };

                        // Create placeholders and values array
                        const keys = Object.keys(mappedData);
                        const values = Object.values(mappedData);
                        const placeholders = keys.map(() => '?').join(', ');

                        const sql = `INSERT INTO items (${keys.join(', ')}) VALUES (${placeholders})`;

                        db.run(sql, values, function (err) {
                            if (err) {
                                console.error(`❌ Error importing item ${itemData.name}:`, err.message);
                                itemsErrors++;
                            } else {
                                itemsImported++;
                            }

                            // Check if all items have been processed
                            if (itemsImported + itemsErrors === itemsData.length) {
                                console.log(`✅ Successfully imported ${itemsImported} items (${itemsErrors} errors)`);

                                // Import customers
                                importCustomers();
                            }
                        });
                    }
                }

                // Import customers function
                function importCustomers() {
                    console.log('👤 Importing customers...');

                    let customersImported = 0;
                    let customersErrors = 0;

                    for (const customer of customersData) {
                        // Remove ID as it will be auto-generated
                        const { id, ...customerData } = customer;

                        // Map specific fields that need special handling
                        const mappedData = {
                            customer_type: customerData.customerType,
                            salutation: customerData.salutation,
                            first_name: customerData.firstName,
                            last_name: customerData.lastName,
                            pan_number: customerData.panNumber,
                            company_name: customerData.companyName,
                            currency: customerData.currency,
                            gst_applicable: customerData.gstApplicable,
                            gstin: customerData.gstin,
                            state_code: customerData.stateCode,
                            billing_country: customerData.billingCountry,
                            billing_state: customerData.billingState,
                            billing_city: customerData.billingCity,
                            billing_address_line_1: customerData.billingAddressLine1,
                            billing_address_line_2: customerData.billingAddressLine2,
                            billing_contact_no: customerData.billingContactNo,
                            billing_email: customerData.billingEmail,
                            billing_alternate_contact_no: customerData.billingAlternateContactNo,
                            shipping_country: customerData.shippingCountry,
                            shipping_state: customerData.shippingState,
                            shipping_city: customerData.shippingCity,
                            shipping_address_line_1: customerData.shippingAddressLine1,
                            shipping_address_line_2: customerData.shippingAddressLine2,
                            shipping_contact_no: customerData.shippingContactNo,
                            shipping_email: customerData.shippingEmail,
                            shipping_alternate_contact_no: customerData.shippingAlternateContactNo,
                            relationship_type: customerData.relationshipType,
                            customer_category: customerData.customerCategory,
                            customer_size: customerData.customerSize,
                            industry: customerData.industry,
                            account_manager: customerData.accountManager,
                            relationship_start_date: customerData.relationshipStartDate,
                            customer_status: customerData.customerStatus,
                            credit_limit: customerData.creditLimit,
                            payment_terms: customerData.paymentTerms,
                            preferred_payment_method: customerData.preferredPaymentMethod,
                            satisfaction_score: customerData.satisfactionScore,
                            risk_rating: customerData.riskRating,
                            loyalty_score: customerData.loyaltyScore,
                            acquisition_channel: customerData.acquisitionChannel,
                            lifetime_value: customerData.lifetimeValue,
                            churn_probability: customerData.churnProbability,
                            preferred_contact_method: customerData.preferredContactMethod,
                            marketing_opt_in: customerData.marketingOptIn,
                            notes: customerData.notes,
                            tags: customerData.tags,
                            custom_fields: customerData.customFields
                        };

                        // Create placeholders and values array
                        const keys = Object.keys(mappedData);
                        const values = Object.values(mappedData);
                        const placeholders = keys.map(() => '?').join(', ');

                        const sql = `INSERT INTO customers (${keys.join(', ')}) VALUES (${placeholders})`;

                        db.run(sql, values, function (err) {
                            if (err) {
                                console.error(`❌ Error importing customer ${customerData.firstName} ${customerData.lastName}:`, err.message);
                                customersErrors++;
                            } else {
                                customersImported++;
                            }

                            // Check if all customers have been processed
                            if (customersImported + customersErrors === customersData.length) {
                                console.log(`✅ Successfully imported ${customersImported} customers (${customersErrors} errors)`);

                                // Commit transaction
                                db.run('COMMIT', function (err) {
                                    if (err) {
                                        console.error('❌ Error committing transaction:', err.message);
                                        return;
                                    }

                                    console.log('✅ All data imported successfully!');

                                    // Close database connection
                                    db.close((err) => {
                                        if (err) {
                                            console.error('❌ Error closing database:', err.message);
                                        }
                                        console.log('👋 Database connection closed');
                                    });
                                });
                            }
                        });
                    }
                }

                // If no companies to import, move to items
                if (companiesData.length === 0) {
                    console.log('⚠️ No companies to import');
                    importItems();
                }
            });
        });
    });
} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
} 