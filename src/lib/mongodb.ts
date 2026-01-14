// NOTE: This file is intended for a Node.js/Next.js Server Environment.
// In this browser-only demo, we use services/db.ts to simulate database persistence.

import { MongoClient } from 'mongodb';

const uri = "mongodb://mongo:ucROwLYfkzIGTIjrWdlPczZiDbBHYfRg@hopper.proxy.rlwy.net:37265";
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.NEXT_PUBLIC_SIMULATION_MODE) {
  // In a real Next.js app, this connects to your Railway MongoDB
  if (typeof window === 'undefined') {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  } else {
    // Browser fallback
    clientPromise = Promise.resolve(null as any);
  }
} else {
  // Fallback for simulation
  clientPromise = Promise.resolve(null as any);
}

export default clientPromise;