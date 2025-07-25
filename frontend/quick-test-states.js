const DatabaseManager = require("./db/db");
const { states } = require("./db/schema/State");
const { cities } = require("./db/schema/City");
const { eq } = require('drizzle-orm');

async function quickTestStates() {
    console.log('🚀 Quick States Test - Checking Database Schema...\n');

    try {
        // Initialize database
        const dbManager = DatabaseManager.getInstance();
        const db = dbManager.getDatabase();
        console.log('✅ Database connected successfully');

        // Check if states table exists and has data
        console.log('\n📊 Current Database Status:');

        try {
            const statesCount = await db.select().from(states);
            console.log(`   📍 States in database: ${statesCount.length}`);

            if (statesCount.length > 0) {
                console.log('\n📋 Sample States:');
                statesCount.slice(0, 5).forEach(state => {
                    console.log(`   ✓ ${state.name} (Code: ${state.code})`);
                });

                if (statesCount.length > 5) {
                    console.log(`   ... and ${statesCount.length - 5} more states`);
                }
            }
        } catch (error) {
            console.log('   ❌ States table not accessible:', error.message);
        }

        try {
            const citiesCount = await db.select().from(cities);
            console.log(`   🏙️  Cities in database: ${citiesCount.length}`);

            if (citiesCount.length > 0) {
                console.log('\n🏙️  Sample Cities:');
                const citiesWithStates = await db
                    .select({
                        cityName: cities.name,
                        stateName: states.name
                    })
                    .from(cities)
                    .leftJoin(states, eq(cities.stateId, states.id))
                    .limit(3);

                citiesWithStates.forEach(city => {
                    console.log(`   ✓ ${city.cityName}, ${city.stateName}`);
                });
            }
        } catch (error) {
            console.log('   ❌ Cities table not accessible:', error.message);
        }

        // Test specific queries
        console.log('\n🔍 Testing Specific Queries:');

        try {
            const maharashtra = await db.select().from(states).where(eq(states.name, "Maharashtra"));
            if (maharashtra.length > 0) {
                console.log(`   ✅ Maharashtra found with code: ${maharashtra[0].code}`);
            } else {
                console.log('   ⚠️  Maharashtra not found in database');
            }
        } catch (error) {
            console.log('   ❌ Query test failed:', error.message);
        }

        console.log('\n✅ Quick test completed successfully!');

    } catch (error) {
        console.error('❌ Quick test failed:', error);
    }
}

// Run the quick test
quickTestStates().catch(console.error); 