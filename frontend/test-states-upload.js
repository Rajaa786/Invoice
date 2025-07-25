const DatabaseManager = require("./db/db");
const { states } = require("./db/schema/State");
const { cities } = require("./db/schema/City");
const { eq } = require('drizzle-orm');

// Complete list of Indian states and union territories with GST state codes
const testStatesData = [
    { name: "Andhra Pradesh", code: "37" },
    { name: "Arunachal Pradesh", code: "12" },
    { name: "Assam", code: "18" },
    { name: "Bihar", code: "10" },
    { name: "Chhattisgarh", code: "22" },
    { name: "Goa", code: "30" },
    { name: "Gujarat", code: "24" },
    { name: "Haryana", code: "06" },
    { name: "Himachal Pradesh", code: "02" },
    { name: "Jharkhand", code: "20" },
    { name: "Karnataka", code: "29" },
    { name: "Kerala", code: "32" },
    { name: "Madhya Pradesh", code: "23" },
    { name: "Maharashtra", code: "27" },
    { name: "Manipur", code: "14" },
    { name: "Meghalaya", code: "17" },
    { name: "Mizoram", code: "15" },
    { name: "Nagaland", code: "13" },
    { name: "Odisha", code: "21" },
    { name: "Punjab", code: "03" },
    { name: "Rajasthan", code: "08" },
    { name: "Sikkim", code: "11" },
    { name: "Tamil Nadu", code: "33" },
    { name: "Telangana", code: "36" },
    { name: "Tripura", code: "16" },
    { name: "Uttar Pradesh", code: "09" },
    { name: "Uttarakhand", code: "05" },
    { name: "West Bengal", code: "19" },
    { name: "Delhi", code: "07" },
    { name: "Jammu and Kashmir", code: "01" },
    { name: "Ladakh", code: "38" },
    { name: "Puducherry", code: "34" },
    { name: "Chandigarh", code: "04" },
    { name: "Andaman and Nicobar Islands", code: "35" },
    { name: "Dadra and Nagar Haveli and Daman and Diu", code: "26" },
    { name: "Lakshadweep", code: "31" }
];

const testCitiesData = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Aurangabad", "Nashik"],
    "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli-Dharwad", "Mangaluru"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"]
};

async function testStatesUpload() {
    console.log('🧪 Starting States Upload Test...\n');

    try {
        // Initialize database
        console.log('📁 Initializing database connection...');
        const dbManager = DatabaseManager.getInstance();
        const db = dbManager.getDatabase();
        console.log('✅ Database connected successfully\n');

        // Clear existing data for clean test
        console.log('🧹 Clearing existing states and cities data...');
        await db.delete(cities);
        await db.delete(states);
        console.log('✅ Existing data cleared\n');

        // Upload states
        console.log('🏛️  Uploading states data...');
        let uploadedStates = 0;
        const stateIdMap = {};

        for (const stateData of testStatesData) {
            try {
                const result = await db.insert(states).values({
                    name: stateData.name,
                    code: stateData.code,
                    country: "India",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }).returning();

                if (result && result[0]) {
                    stateIdMap[stateData.name] = result[0].id;
                    uploadedStates++;
                    console.log(`   ✓ ${stateData.name} (Code: ${stateData.code}) - ID: ${result[0].id}`);
                }
            } catch (error) {
                console.error(`   ❌ Failed to upload ${stateData.name}:`, error.message);
            }
        }

        console.log(`\n📊 States Upload Summary: ${uploadedStates}/${testStatesData.length} states uploaded successfully\n`);

        // Upload sample cities
        console.log('🏙️  Uploading sample cities data...');
        let uploadedCities = 0;

        for (const [stateName, cityNames] of Object.entries(testCitiesData)) {
            const stateId = stateIdMap[stateName];
            if (!stateId) {
                console.error(`   ❌ State ID not found for ${stateName}`);
                continue;
            }

            console.log(`   📍 Adding cities for ${stateName}:`);
            for (const cityName of cityNames) {
                try {
                    await db.insert(cities).values({
                        name: cityName,
                        stateId: stateId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    uploadedCities++;
                    console.log(`      ✓ ${cityName}`);
                } catch (error) {
                    console.error(`      ❌ Failed to upload ${cityName}:`, error.message);
                }
            }
        }

        console.log(`\n📊 Cities Upload Summary: ${uploadedCities} cities uploaded successfully\n`);

        // Verification tests
        console.log('🔍 Running verification tests...\n');

        // Test 1: Count states
        const statesCount = await db.select().from(states);
        console.log(`✅ Test 1 - States Count: ${statesCount.length} states in database`);

        // Test 2: Count cities
        const citiesCount = await db.select().from(cities);
        console.log(`✅ Test 2 - Cities Count: ${citiesCount.length} cities in database`);

        // Test 3: Check specific state codes
        const maharashtraState = await db.select().from(states).where(eq(states.name, "Maharashtra"));
        const delhiState = await db.select().from(states).where(eq(states.name, "Delhi"));

        console.log(`✅ Test 3 - Maharashtra State Code: ${maharashtraState[0]?.code === "27" ? "27 ✓" : "❌ Incorrect"}`);
        console.log(`✅ Test 4 - Delhi State Code: ${delhiState[0]?.code === "07" ? "07 ✓" : "❌ Incorrect"}`);

        // Test 5: Check city-state relationships
        const mumbaiCities = await db.select().from(cities).where(eq(cities.name, "Mumbai"));
        const mumbaiStateId = mumbaiCities[0]?.stateId;
        const mumbaiState = await db.select().from(states).where(eq(states.id, mumbaiStateId));

        console.log(`✅ Test 5 - Mumbai-Maharashtra Link: ${mumbaiState[0]?.name === "Maharashtra" ? "✓ Correct" : "❌ Incorrect"}`);

        // Test 6: GST state code uniqueness
        const uniqueCodes = new Set(statesCount.map(s => s.code));
        console.log(`✅ Test 6 - Unique State Codes: ${uniqueCodes.size === statesCount.length ? "✓ All unique" : "❌ Duplicates found"}`);

        // Display sample data
        console.log('\n📋 Sample States Data:');
        console.log('┌─────────────────────────────────┬──────┬────┐');
        console.log('│ State Name                      │ Code │ ID │');
        console.log('├─────────────────────────────────┼──────┼────┤');

        const sampleStates = statesCount.slice(0, 5);
        sampleStates.forEach(state => {
            const name = state.name.padEnd(30);
            const code = state.code.padEnd(4);
            const id = state.id.toString().padEnd(2);
            console.log(`│ ${name} │ ${code} │ ${id} │`);
        });
        console.log('└─────────────────────────────────┴──────┴────┘');

        console.log('\n📋 Sample Cities Data:');
        console.log('┌─────────────────────┬─────────────────────────────────┬────┐');
        console.log('│ City Name           │ State Name                      │ ID │');
        console.log('├─────────────────────┼─────────────────────────────────┼────┤');

        const sampleCitiesWithStates = await db
            .select({
                cityName: cities.name,
                stateName: states.name,
                cityId: cities.id
            })
            .from(cities)
            .leftJoin(states, eq(cities.stateId, states.id))
            .limit(5);

        sampleCitiesWithStates.forEach(city => {
            const cityName = city.cityName.padEnd(18);
            const stateName = city.stateName.padEnd(30);
            const id = city.cityId.toString().padEnd(2);
            console.log(`│ ${cityName} │ ${stateName} │ ${id} │`);
        });
        console.log('└─────────────────────┴─────────────────────────────────┴────┘');

        console.log('\n🎉 States Upload Test Completed Successfully!');
        console.log(`📈 Final Stats: ${statesCount.length} states, ${citiesCount.length} cities`);

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        console.log('\n🔚 Test execution finished.');
        process.exit(0);
    }
}

// Run the test
if (require.main === module) {
    testStatesUpload().catch(console.error);
}

module.exports = { testStatesUpload }; 