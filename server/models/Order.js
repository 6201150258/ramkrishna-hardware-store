import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true }
  },
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
