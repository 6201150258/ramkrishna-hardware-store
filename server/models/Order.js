import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: [{
    id: Number,
    name: String,
    english: String,
    category: String,
    price: Number,
    unit: String,
    image: String,
    quantity: Number
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'नया ऑर्डर' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
