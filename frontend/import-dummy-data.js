const fs = require('fs');
const path = require('path');
const DatabaseManager = require('./db/db');

// Import schemas
const { companies } = require('./db/schema/Company');
const { customers } = require('./db/schema/Customer');
const { items } = require('./db/schema/Item');

// Path to the dummy data
const dummyDataDir = path.join(__dirname, './dummy-data');

// Check if dummy data exists
if (!fs.existsSync(dummyDataDir)) {
    console.error('❌ Dummy data directory not found. Please run test-dummy-data-generator.js first.');
    process.exit(1);
}

try {
    console.log('🔄 Connecting to database...');

    // Get database instance using the singleton pattern
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getDatabase();

    console.log('✅ Connected to database');

    // Load dummy data
    console.log('�� Loading dummy data...');

    const companiesData = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'companies.json'), 'utf8'));
    const itemsData = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'items.json'), 'utf8'));
    const customersData = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'customers.json'), 'utf8'));

    console.log(`📊 Found ${companiesData.length} companies, ${itemsData.length} items, and ${customersData.length} customers`);

    // Import companies
    async function importCompanies() {
        console.log('🏢 Importing companies...');

        // Remove ID from each company as it will be auto-generated
        const companiesToImport = companiesData.map(company => {
            const { id, ...rest } = company;
            return rest;
        });

        try {
            for (const company of companiesToImport) {
                await db.insert(companies).values(company);
            }
            console.log(`✅ Successfully imported ${companiesToImport.length} companies`);
        } catch (error) {
            console.error('❌ Error importing companies:', error);
            throw error;
        }
    }

    // Import items
    async function importItems() {
        console.log('📦 Importing items...');

        // Remove ID from each item as it will be auto-generated
        const itemsToImport = itemsData.map(item => {
            const { id, ...rest } = item;
            return rest;
        });

        try {
            for (const item of itemsToImport) {
                await db.insert(items).values(item);
            }
            console.log(`✅ Successfully imported ${itemsToImport.length} items`);
        } catch (error) {
            console.error('❌ Error importing items:', error);
            throw error;
        }
    }

    // Import customers
    async function importCustomers() {
        console.log('👤 Importing customers...');

        // Remove ID from each customer as it will be auto-generated
        const customersToImport = customersData.map(customer => {
            const { id, ...rest } = customer;
            return rest;
        });

        try {
            for (const customer of customersToImport) {
                await db.insert(customers).values(customer);
            }
            console.log(`✅ Successfully imported ${customersToImport.length} customers`);
        } catch (error) {
            console.error('❌ Error importing customers:', error);
            throw error;
        }
    }

    // Main import function
    async function importAllData() {
        try {
            console.log('🚀 Starting data import process...');

            await importCompanies();
            await importItems();
            await importCustomers();

            console.log('✅ All data imported successfully!');
        } catch (error) {
            console.error('❌ Error importing data:', error);
            process.exit(1);
        }
    }

    // Execute the import
    importAllData();

} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
} 