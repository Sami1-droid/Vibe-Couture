const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['eau-de-parfum', 'eau-de-toilette', 'eau-de-cologne', 'parfum', 'body-spray', 'gift-set']
  },
  gender: {
    type: String,
    required: [true, 'Gender target is required'],
    enum: ['men', 'women', 'unisex']
  },
  scentFamily: {
    primary: {
      type: String,
      required: true,
      enum: ['floral', 'woody', 'fresh', 'oriental', 'fruity', 'spicy', 'citrus', 'aquatic']
    },
    secondary: [{
      type: String,
      enum: ['floral', 'woody', 'fresh', 'oriental', 'fruity', 'spicy', 'citrus', 'aquatic']
    }]
  },
  notes: {
    top: [{
      type: String,
      required: true
    }],
    middle: [{
      type: String,
      required: true
    }],
    base: [{
      type: String,
      required: true
    }]
  },
  variants: [{
    size: {
      type: String,
      required: true,
      enum: ['15ml', '30ml', '50ml', '75ml', '100ml', '125ml', '150ml', '200ml']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative']
    },
    sku: {
      type: String,
      required: true,
      unique: true
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    weight: {
      type: Number, // in grams
      required: true
    },
    dimensions: {
      length: Number, // in cm
      width: Number,
      height: Number
    }
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  concentration: {
    type: String,
    enum: ['5-15%', '15-20%', '20-30%', '30-40%', '40%+']
  },
  longevity: {
    type: String,
    enum: ['2-4 hours', '4-6 hours', '6-8 hours', '8+ hours']
  },
  sillage: {
    type: String,
    enum: ['intimate', 'moderate', 'strong', 'enormous']
  },
  season: [{
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter']
  }],
  occasion: [{
    type: String,
    enum: ['casual', 'formal', 'romantic', 'sport', 'office', 'evening', 'special-occasion']
  }],
  ageGroup: [{
    type: String,
    enum: ['teens', 'young-adult', 'adult', 'mature']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  isLimitedEdition: {
    type: Boolean,
    default: false
  },
  launchDate: {
    type: Date
  },
  discontinuedDate: {
    type: Date
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      maxlength: [100, 'Review title cannot exceed 100 characters']
    },
    comment: {
      type: String,
      required: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    helpful: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Indexes
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ 'scentFamily.primary': 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ isBestseller: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ totalSales: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'variants.price': 1 });

// Virtual for minimum price
productSchema.virtual('minPrice').get(function() {
  if (this.variants && this.variants.length > 0) {
    return Math.min(...this.variants.map(v => v.price));
  }
  return 0;
});

// Virtual for maximum price
productSchema.virtual('maxPrice').get(function() {
  if (this.variants && this.variants.length > 0) {
    return Math.max(...this.variants.map(v => v.price));
  }
  return 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
  return this.variants.some(variant => variant.stock > 0);
});

// Virtual for total stock
productSchema.virtual('totalStock').get(function() {
  return this.variants.reduce((total, variant) => total + variant.stock, 0);
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Pre-save middleware to ensure only one primary image
productSchema.pre('save', function(next) {
  if (this.isModified('images')) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep only the first primary image
      this.images.forEach((img, index) => {
        if (index > 0) img.isPrimary = false;
      });
    } else if (primaryImages.length === 0 && this.images.length > 0) {
      // Set the first image as primary if none is set
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
    return;
  }

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.averageRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
  this.totalReviews = this.reviews.length;
};

// Method to add review
productSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
  this.calculateAverageRating();
  return this.save();
};

// Method to update stock
productSchema.methods.updateStock = function(variantId, quantity) {
  const variant = this.variants.id(variantId);
  if (variant) {
    variant.stock = Math.max(0, variant.stock + quantity);
  }
  return this.save();
};

// Static method to find products by filters
productSchema.statics.findByFilters = function(filters) {
  const query = { isActive: true };

  if (filters.category) query.category = filters.category;
  if (filters.gender) query.gender = filters.gender;
  if (filters.brand) query.brand = new RegExp(filters.brand, 'i');
  if (filters.scentFamily) query['scentFamily.primary'] = filters.scentFamily;
  if (filters.minPrice || filters.maxPrice) {
    query['variants.price'] = {};
    if (filters.minPrice) query['variants.price'].$gte = filters.minPrice;
    if (filters.maxPrice) query['variants.price'].$lte = filters.maxPrice;
  }
  if (filters.season) query.season = { $in: filters.season };
  if (filters.occasion) query.occasion = { $in: filters.occasion };

  return this.find(query);
};

module.exports = mongoose.model('Product', productSchema);