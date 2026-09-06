import { initializeDatabase } from '../database.js';
await initializeDatabase();
console.log('Database initialized; existing production content preserved.');
