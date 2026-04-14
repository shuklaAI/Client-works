const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Review must belong to a product']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: 1000
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

// Static method to calculate average rating and update product
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        ratingsCount: { $sum: 1 },
        ratingsAverage: { $avg: '$rating' }
      }
    }
  ]);

  try {
    const Product = mongoose.model('Product');
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        ratingsCount: stats[0].ratingsCount,
        ratingsAverage: Math.round(stats[0].ratingsAverage * 10) / 10
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        ratingsCount: 0,
        ratingsAverage: 0
      });
    }
  } catch (err) {
    console.error('Error updating product ratings:', err.message);
  }
};

// Update ratings after save
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.product);
});

// Update ratings after delete
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) doc.constructor.calcAverageRating(doc.product);
});

module.exports = mongoose.model('Review', reviewSchema);
