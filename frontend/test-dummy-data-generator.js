const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

console.log('Starting dummy data generation...');

// Generate random companies
function generateCompanies(count = 5) {
    console.log(`Generating ${count} companies...`);

    const companyData = Array.from({ length: count }, () => ({
        id: faker.number.int({ min: 1, max: 1000 }),
        companyType: faker.helpers.arrayElement(['Manufacturer', 'Trader', 'Services']),
        companyName: faker.company.name(),
        currency: faker.helpers.arrayElement(['INR', 'USD', 'EUR']),
        gstApplicable: faker.helpers.arrayElement(['Yes', 'No']),
        gstin: faker.helpers.arrayElement(['Yes', 'No']) === 'Yes' ?
            `${faker.string.alpha(2).toUpperCase()}${faker.string.numeric(10)}${faker.string.alpha(1).toUpperCase()}${faker.string.numeric(1)}Z${faker.string.alpha(1).toUpperCase()}` : null,
        stateCode: faker.helpers.arrayElement(['Yes', 'No']) === 'Yes' ?
            faker.string.numeric(2) : null,
        country: faker.location.country(),
        addressLine1: faker.location.streetAddress(),
        addressLine2: faker.location.secondaryAddress(),
        state: faker.location.state(),
        city: faker.location.city(),
        email: faker.internet.email(),
        contactNo: faker.phone.number(),
        establishedYear: faker.number.int({ min: 1980, max: 2023 }),
        employeeCount: faker.number.int({ min: 5, max: 1000 }),
        website: faker.internet.url(),
        industry: faker.helpers.arrayElement(['Technology', 'Manufacturing', 'Services', 'Healthcare', 'Retail']),
        annualRevenue: faker.number.int({ min: 100000, max: 10000000 }),
        businessModel: faker.helpers.arrayElement(['B2B', 'B2C', 'B2B2C']),
        companySize: faker.helpers.arrayElement(['Startup', 'SME', 'Enterprise']),
        primaryMarket: faker.helpers.arrayElement(['Domestic', 'International', 'Both']),
        customerSegment: faker.helpers.arrayElement(['Enterprise', 'SMB', 'Consumer']),
        valueProposition: faker.helpers.arrayElement(['Cost Leadership', 'Differentiation', 'Focus']),
        operatingHours: faker.helpers.arrayElement(['24/7', 'Business Hours', 'Custom']),
        timezone: faker.helpers.arrayElement(['IST', 'EST', 'PST', 'GMT']),
    }));

    console.log(`✅ Successfully created ${count} companies`);
    return companyData;
}

// Generate random items
function generateItems(count = 10) {
    console.log(`Generating ${count} items...`);

    const itemTypes = ['Goods', 'Service'];
    const units = ['pcs', 'kg', 'g', 'l', 'ml', 'hour', 'day', 'month'];
    const currencies = ['INR', 'USD', 'EUR'];

    const itemData = Array.from({ length: count }, () => {
        const type = faker.helpers.arrayElement(itemTypes);

        return {
            id: faker.number.int({ min: 1, max: 1000 }),
            type,
            name: type === 'Goods' ? faker.commerce.product() : faker.commerce.productName(),
            hsnSacCode: type === 'Goods' ?
                faker.string.numeric(8) : // HSN code for goods
                faker.string.numeric(6),  // SAC code for services
            unit: faker.helpers.arrayElement(units),
            sellingPrice: parseFloat(faker.commerce.price({ min: 100, max: 10000, dec: 2 })),
            currency: faker.helpers.arrayElement(currencies),
            description: faker.commerce.productDescription(),
        };
    });

    console.log(`✅ Successfully created ${count} items`);
    return itemData;
}

// Generate random customers
function generateCustomers(count = 8) {
    console.log(`Generating ${count} customers...`);

    const customerData = Array.from({ length: count }, () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const customerType = faker.helpers.arrayElement(['Business', 'Individual']);
        const gstApplicable = faker.helpers.arrayElement(['Yes', 'No']);

        // Generate same address for both billing and shipping with 70% probability
        const useShippingAsBilling = Math.random() > 0.3;

        const billingCountry = faker.location.country();
        const billingState = faker.location.state();
        const billingCity = faker.location.city();
        const billingAddressLine1 = faker.location.streetAddress();
        const billingAddressLine2 = faker.location.secondaryAddress();
        const billingContactNo = faker.phone.number();
        const billingEmail = faker.internet.email({ firstName, lastName });

        return {
            id: faker.number.int({ min: 1, max: 1000 }),
            customerType,
            salutation: faker.helpers.arrayElement(['Mr.', 'Mrs.', 'Ms.', 'Dr.']),
            firstName,
            lastName,
            panNumber: faker.helpers.arrayElement([null, faker.string.alpha(5).toUpperCase() + faker.string.numeric(4) + faker.string.alpha(1).toUpperCase()]),
            companyName: customerType === 'Business' ? faker.company.name() : `${firstName} ${lastName}`,
            currency: faker.helpers.arrayElement(['INR', 'USD', 'EUR']),
            gstApplicable,
            gstin: gstApplicable === 'Yes' ?
                `${faker.string.alpha(2).toUpperCase()}${faker.string.numeric(10)}${faker.string.alpha(1).toUpperCase()}${faker.string.numeric(1)}Z${faker.string.alpha(1).toUpperCase()}` : null,
            stateCode: gstApplicable === 'Yes' ? faker.string.numeric(2) : null,

            // Billing address
            billingCountry,
            billingState,
            billingCity,
            billingAddressLine1,
            billingAddressLine2,
            billingContactNo,
            billingEmail,
            billingAlternateContactNo: Math.random() > 0.5 ? faker.phone.number() : null,

            // Shipping address (may be same as billing)
            shippingCountry: useShippingAsBilling ? billingCountry : faker.location.country(),
            shippingState: useShippingAsBilling ? billingState : faker.location.state(),
            shippingCity: useShippingAsBilling ? billingCity : faker.location.city(),
            shippingAddressLine1: useShippingAsBilling ? billingAddressLine1 : faker.location.streetAddress(),
            shippingAddressLine2: useShippingAsBilling ? billingAddressLine2 : faker.location.secondaryAddress(),
            shippingContactNo: useShippingAsBilling ? billingContactNo : faker.phone.number(),
            shippingEmail: useShippingAsBilling ? billingEmail : faker.internet.email({ firstName, lastName }),
            shippingAlternateContactNo: Math.random() > 0.5 ? faker.phone.number() : null,

            // Enhanced fields
            relationshipType: faker.helpers.arrayElement(['recurring', 'one-time', 'seasonal', 'project-based']),
            customerCategory: faker.helpers.arrayElement(['premium', 'standard', 'basic']),
            customerSize: faker.helpers.arrayElement(['enterprise', 'mid-market', 'small']),
            industry: faker.helpers.arrayElement(['Technology', 'Manufacturing', 'Services', 'Healthcare', 'Retail']),
            accountManager: faker.person.fullName(),
            relationshipStartDate: faker.date.past({ years: 5 }).toISOString().split('T')[0],
            customerStatus: faker.helpers.arrayElement(['active', 'inactive', 'prospect', 'churned']),
            creditLimit: faker.number.int({ min: 10000, max: 1000000 }),
            paymentTerms: faker.helpers.arrayElement(['net_30', 'net_15', 'immediate', 'net_45']),
            preferredPaymentMethod: faker.helpers.arrayElement(['bank_transfer', 'credit_card', 'cash', 'check']),
            satisfactionScore: faker.number.int({ min: 1, max: 5 }),
            riskRating: faker.helpers.arrayElement(['low', 'medium', 'high']),
            loyaltyScore: faker.number.int({ min: 1, max: 100 }),
            acquisitionChannel: faker.helpers.arrayElement(['referral', 'marketing', 'cold_call', 'website']),
            lifetimeValue: faker.number.int({ min: 1000, max: 500000 }),
            churnProbability: faker.number.int({ min: 0, max: 100 }),
            preferredContactMethod: faker.helpers.arrayElement(['email', 'phone', 'sms']),
            marketingOptIn: faker.helpers.arrayElement(['yes', 'no']),
            notes: faker.lorem.paragraph(),
            tags: JSON.stringify(Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.word.sample())),
            customFields: JSON.stringify({
                lastMeeting: faker.date.recent().toISOString(),
                nextFollowUp: faker.date.future().toISOString(),
            }),
        };
    });

    console.log(`✅ Successfully created ${count} customers`);
    return customerData;
}

// Main function to run all generators
function generateAllDummyData() {
    try {
        console.log('🚀 Starting dummy data generation process...');

        const companies = generateCompanies(5);
        const items = generateItems(15);
        const customers = generateCustomers(10);

        // Create output directory if it doesn't exist
        const outputDir = path.join(__dirname, 'dummy-data');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Write data to JSON files
        fs.writeFileSync(
            path.join(outputDir, 'companies.json'),
            JSON.stringify(companies, null, 2)
        );

        fs.writeFileSync(
            path.join(outputDir, 'items.json'),
            JSON.stringify(items, null, 2)
        );

        fs.writeFileSync(
            path.join(outputDir, 'customers.json'),
            JSON.stringify(customers, null, 2)
        );

        console.log('✅ All dummy data generated successfully!');
        console.log(`Data saved to: ${outputDir}`);

        // Print sample data
        console.log('\n📊 Sample Data:');
        console.log('\n🏢 Sample Company:');
        console.log(JSON.stringify(companies[0], null, 2));

        console.log('\n📦 Sample Item:');
        console.log(JSON.stringify(items[0], null, 2));

        console.log('\n👤 Sample Customer:');
        console.log(JSON.stringify(customers[0], null, 2));

    } catch (error) {
        console.error('❌ Error generating dummy data:', error);
        process.exit(1);
    }
}

// Execute the generator
generateAllDummyData(); 