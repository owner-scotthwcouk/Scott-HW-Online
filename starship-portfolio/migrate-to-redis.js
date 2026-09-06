// Migration script to transfer data from data.json to Redis
// Run this script once to migrate your data

import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateToRedis() {
  console.log('Starting Redis migration...');

  // Connect to Redis using Vercel environment variable
  const redisUrl = process.env.STORAGE_URL;
  
  if (!redisUrl) {
    console.error('Error: STORAGE_URL environment variable is not set');
    console.error('Make sure to run: vercel env pull .env.development.local');
    process.exit(1);
  }

  const client = createClient({
    url: redisUrl
  });

  client.on('error', (err) => console.error('Redis Client Error', err));

  try {
    await client.connect();
    console.log('Connected to Redis');

    // Read the data.json file
    const dataPath = path.join(__dirname, 'public', 'data.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log('Read data.json successfully');

    // Store the entire data structure in Redis
    // Using a single key 'portfolio:data' for simplicity
    await client.set('portfolio:data', JSON.stringify(jsonData));
    console.log('Stored portfolio data in Redis under key: portfolio:data');

    // Alternatively, you can store sections separately for more flexibility:
    // Uncomment these lines if you prefer separate keys:
    /*
    await client.set('portfolio:about', JSON.stringify(jsonData.about));
    await client.set('portfolio:projects', JSON.stringify(jsonData.projects));
    await client.set('portfolio:mission_update', JSON.stringify(jsonData.mission_update));
    await client.set('portfolio:contact', JSON.stringify(jsonData.contact));
    console.log('Stored portfolio sections in Redis');
    */

    // Verify the data was stored
    const storedData = await client.get('portfolio:data');
    if (storedData) {
      console.log('✅ Migration successful! Data verified in Redis.');
      console.log('Data size:', storedData.length, 'bytes');
    } else {
      console.error('❌ Migration failed: Could not verify data in Redis');
    }

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await client.disconnect();
    console.log('Disconnected from Redis');
  }
}

migrateToRedis();
