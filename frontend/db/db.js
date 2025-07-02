require("dotenv").config();
const { drizzle } = require("drizzle-orm/better-sqlite3");
const Database = require("better-sqlite3");
const path = require("path");
const log = require('electron-log/main');

class DatabaseManager {
  static #instance = null;

  static getInstance() {
    if (!DatabaseManager.#instance) {
      // Use DB_FILE_NAME from env or default to local database
      const dbPath = process.env.DB_FILE_NAME || path.join(__dirname, '../db.sqlite3');

      log.info('Initializing database connection...');
      log.debug('Database path:', dbPath);

      try {
        // Create better-sqlite3 database instance
        // const sqlite = new Database(dbPath);

        // Enable foreign keys and other optimizations
        // sqlite.pragma('foreign_keys = ON');
        // sqlite.pragma('journal_mode = WAL');
        // sqlite.pragma('synchronous = NORMAL');

        // Create Drizzle ORM instance with the sqlite database
        const db = drizzle(dbPath);

        DatabaseManager.#instance = new DatabaseManager(db);
        log.info('Database connected successfully');
      } catch (error) {
        log.error('Database connection failed:', error);
        throw new Error(`Failed to connect to database: ${error.message}`);
      }
    }
    return DatabaseManager.#instance;
  }

  constructor(db) {
    this.db = db;
    // this.sqlite = sqlite;
    log.debug('DatabaseManager instance created');
  }

  getDatabase() {
    return this.db;
  }

  // getSqliteInstance() {
  //   return this.sqlite;
  // }

  close() {
    // if (this.sqlite) {
    //   this.sqlite.close();
    //   console.log('Database connection closed');
    // }
  }
}

// Test code
// const db = drizzle(createClient({ url: process.env.DB_FILE_NAME }));

// async function main() {
//   // const user = {
//   //   name: 'John',
//   //   email: 'john@example.com'
//   // };

//   // await db.insert(users).values(user);
//   // console.log('New user created!');

//   const allUsers = await db.select().from(users);
//   console.log('Getting all users from the database: ', users);

//   await db.update(users)
//   .set({ name: 'Mr. Vivek' })
//   .where(eq(users.name, 'Mr. Dan'));

//   console.log('User updated!');
//   const updatedUsers = await db.select().from(users);
//   console.log('Updated users: ', updatedUsers);

//   // await db.delete(users).where(eq(users.name, 'John'));
//   // console.log('User deleted!');
// }

// main();

// Uncomment to export the DatabaseManager instance
module.exports = DatabaseManager;
