const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      size: String,
      sku: String,
      price: Number
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    name: String, // Store product name at time of order
    image: String // Store primary image URL at time of order
  }],
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    amount: {
      type: Number,
      default: 0
    },
    code: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  },
  total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'apple_pay', 'google_pay'],
    required: true
  },
  paymentIntentId: String,
  transactionId: String,
  shippingAddress: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'United States'
    },
    phone: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  shipping: {
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup'],
      default: 'standard'
    },
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  notes: String,
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  refunds: [{
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    refundId: String,
    processedAt: {
      type: Date,
      default: Date.now
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  customerNotes: String,
  adminNotes: String,
  source: {
    type: String,
    enum: ['web', 'mobile', 'phone', 'admin'],
    default: 'web'
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ email: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.zipCode': 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get the count of orders today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    const todayOrdersCount = await this.constructor.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });
    
    const sequence = String(todayOrdersCount + 1).padStart(4, '0');
    this.orderNumber = `PF${year}${month}${day}${sequence}`;
  }
  next();
});

// Pre-save middleware to add status history
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Virtual for full name
orderSchema.virtual('customerName').get(function() {
  return `${this.shippingAddress.firstName} ${this.shippingAddress.lastName}`;
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for items count
orderSchema.virtual('itemsCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Calculate tax (assuming 8.5% tax rate)
  this.tax = Math.round(this.subtotal * 0.085 * 100) / 100;
  
  // Calculate total
  this.total = this.subtotal + this.shippingCost + this.tax - this.discount.amount;
  this.total = Math.round(this.total * 100) / 100;
};

// Method to add status update
orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note,
    updatedBy: updatedBy
  });
  return this.save();
};

// Method to process refund
orderSchema.methods.processRefund = function(amount, reason, refundId, processedBy) {
  this.refunds.push({
    amount: amount,
    reason: reason,
    refundId: refundId,
    processedBy: processedBy
  });
  
  const totalRefunded = this.refunds.reduce((total, refund) => total + refund.amount, 0);
  
  if (totalRefunded >= this.total) {
    this.paymentStatus = 'refunded';
    this.status = 'refunded';
  } else {
    this.paymentStatus = 'partially_refunded';
  }
  
  return this.save();
};

// Static method to get sales analytics
orderSchema.statics.getSalesAnalytics = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        avgOrderValue: { $avg: '$total' },
        totalItems: { $sum: { $size: '$items' } }
      }
    }
  ];
  
  const [result] = await this.aggregate(pipeline);
  return result || {
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalItems: 0
  };
};

// Static method to get top products
orderSchema.statics.getTopProducts = async function(limit = 10) {
  const pipeline = [
    { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Order', orderSchema);