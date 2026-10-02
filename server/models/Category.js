import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' },
  slug: { type: String, lowercase: true }
}, { timestamps: true });

// Change module.exports to export default
export default mongoose.model('Category', categorySchema);