const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  richDescription: String,
  images: [{
    url: { type: String, required: true },
    alt: String
  }],
  brand: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  mrp: {
    type: Number,
    min: 0
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  features: [String],
  tags: [String],
  ratingsAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingsCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount price display
productSchema.virtual('hasDiscount').get(function () {
  return this.mrp && this.mrp > this.price;
});

module.exports = mongoose.model('Product', productSchema);
