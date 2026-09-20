import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  english: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
