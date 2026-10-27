import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      try {
        console.log(`Connecting to external MongoDB at ${mongoUri}...`);
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 4000,
        });
        console.log(`MongoDB Connected (External): ${conn.connection.host}`);
        return;
      } catch (externalErr) {
        console.warn(`External MongoDB connection failed (${externalErr.message}). Falling back to Embedded MongoDB...`);
      }
    }

    console.log('Initializing embedded in-memory MongoDB instance for zero-config operation...');
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`Embedded MongoDB Connected: ${conn.connection.host}`);
    console.log(`Mongo In-Memory URI: ${uri}`);
  } catch (error) {
    console.error(`MongoDB initialization error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('Error disconnecting database:', err);
  }
};
