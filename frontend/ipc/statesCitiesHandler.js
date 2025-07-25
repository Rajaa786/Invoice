const { ipcMain } = require("electron");
const log = require('electron-log/main');
const DatabaseManager = require("../db/db");
const { states } = require("../db/schema/State");
const { cities } = require("../db/schema/City");
const { eq, like, and, desc } = require('drizzle-orm');

// Complete list of Indian states and union territories with GST state codes
const initialStatesData = [
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

const initialCitiesData = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Aurangabad", "Nashik", "Kolhapur", "Thane", "Solapur", "Sangli"],
    "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi", "Shahdara"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli-Dharwad", "Mangaluru", "Belagavi", "Ballari", "Davanagere", "Shivamogga"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thanjavur"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand"],
    "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur"],
    "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Bharatpur", "Pali", "Bhilwara"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Batala", "Pathankot"],
    "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal", "Sonipat", "Yamunanagar", "Rohtak", "Hisar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Moradabad", "Saharanpur", "Gorakhpur", "Noida"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Una", "Kullu", "Hamirpur"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani-cum-Kathgodam", "Rudrapur", "Kashipur", "Rishikesh"],
    "Goa": ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda", "Bicholim"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Korba", "Bilaspur", "Durg", "Rajnandgaon"],
    "Chandigarh": ["Chandigarh"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
};

function registerStatesCitiesIpc() {
    try {
        log.info('Registering States and Cities IPC handlers...');
        const dbManager = DatabaseManager.getInstance();
        const db = dbManager.getDatabase();

        // Seed initial data
        ipcMain.handle("seed-states-cities", async (event) => {
            try {
                log.info("🌱 Starting states and cities seeding...");

                // Check if states already exist
                const existingStates = await db.select().from(states).limit(1);
                if (existingStates.length > 0) {
                    log.info("States already seeded, skipping...");
                    return { success: true, message: "Already seeded" };
                }

                // Insert states
                for (const stateData of initialStatesData) {
                    await db.insert(states).values({
                        name: stateData.name,
                        code: stateData.code,
                        country: "India",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }

                // Insert cities
                for (const [stateName, cityNames] of Object.entries(initialCitiesData)) {
                    const stateRecord = await db.select().from(states).where(eq(states.name, stateName)).limit(1);
                    if (stateRecord.length > 0) {
                        const stateId = stateRecord[0].id;
                        for (const cityName of cityNames) {
                            await db.insert(cities).values({
                                name: cityName,
                                stateId: stateId,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            });
                        }
                    }
                }

                log.info("✅ States and cities seeded successfully");
                return { success: true, message: "Seeded successfully" };
            } catch (error) {
                log.error("❌ Seeding failed:", error);
                return { success: false, error: error.message };
            }
        });

        // Get all states
        ipcMain.handle("get-states", async (event) => {
            try {
                const statesList = await db.select().from(states).orderBy(states.name);
                return { success: true, states: statesList };
            } catch (error) {
                log.error("Error getting states:", error);
                return { success: false, error: error.message };
            }
        });

        // Get cities by state
        ipcMain.handle("get-cities-by-state", async (event, stateId) => {
            try {
                const citiesList = await db.select().from(cities)
                    .where(eq(cities.stateId, stateId))
                    .orderBy(cities.name);
                return { success: true, cities: citiesList };
            } catch (error) {
                log.error("Error getting cities:", error);
                return { success: false, error: error.message };
            }
        });

        // Note: States cannot be added dynamically - they are pre-seeded with all Indian states

        // Add new city
        ipcMain.handle("add-city", async (event, cityData) => {
            try {
                const result = await db.insert(cities).values({
                    name: cityData.name,
                    stateId: cityData.stateId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                log.info("✅ City added:", cityData.name);
                return { success: true, result };
            } catch (error) {
                log.error("Error adding city:", error);
                return { success: false, error: error.message };
            }
        });

        log.info('✅ States and Cities IPC handlers registered successfully');
    } catch (error) {
        log.error('❌ Failed to register States and Cities IPC handlers:', error);
    }
}

module.exports = { registerStatesCitiesIpc }; 