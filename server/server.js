import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { orderRoutes } from './routes/orderRoutes.js';

const app = express();
const port = process.env.PORT || 5000;
let reconnectTimer;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api/orders', orderRoutes);

const connectToMongo = async () => {
  if (!process.env.MONGODB_URI || mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected.');
    clearInterval(reconnectTimer);
  } catch (error) {
    console.error('MongoDB connection failed. Retrying in 15 seconds.', error.message);
  }
};

app.get('/api/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({ ok: connected, database: connected ? 'connected' : 'not connected' });
});

app.listen(port, async () => {
  console.log(`API server running at http://localhost:${port}`);
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is missing. Add it to .env to enable MongoDB orders.');
    return;
  }
  await connectToMongo();
  reconnectTimer = setInterval(connectToMongo, 15000);
});
