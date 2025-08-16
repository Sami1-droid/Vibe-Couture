const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      size: {
        type: String,
        required: true
      },
      sku: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  subtotal: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  savedForLater: [{
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
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  appliedCoupon: {
    code: String,
    discount: {
      type: Number,
      default: 0
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 days in seconds
  }
}, {
  timestamps: true
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ 'items.product': 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.calculateTotals();
  next();
});

// Method to calculate totals
cartSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.variant.price * item.quantity);
  }, 0);
  
  this.totalItems = this.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
  
  // Round to 2 decimal places
  this.subtotal = Math.round(this.subtotal * 100) / 100;
};

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, variantData, quantity = 1) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() && 
    item.variant.sku === variantData.sku
  );

  if (existingItemIndex > -1) {
    // Update quantity of existing item
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      variant: variantData,
      quantity: quantity
    });
  }

  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Reset expiry
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, sku, quantity) {
  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() && 
    item.variant.sku === sku
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
    }
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId, sku) {
  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() && 
    item.variant.sku === sku
  );

  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Method to save item for later
cartSchema.methods.saveForLater = async function(productId, sku) {
  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() && 
    item.variant.sku === sku
  );

  if (itemIndex > -1) {
    const item = this.items[itemIndex];
    
    // Check if already saved
    const alreadySaved = this.savedForLater.some(saved => 
      saved.product.toString() === productId.toString() && 
      saved.variant.sku === sku
    );

    if (!alreadySaved) {
      this.savedForLater.push({
        product: item.product,
        variant: item.variant
      });
    }

    this.items.splice(itemIndex, 1);
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Method to move item from saved to cart
cartSchema.methods.moveToCart = async function(productId, sku) {
  const savedIndex = this.savedForLater.findIndex(item => 
    item.product.toString() === productId.toString() && 
    item.variant.sku === sku
  );

  if (savedIndex > -1) {
    const savedItem = this.savedForLater[savedIndex];
    
    // Add to cart
    await this.addItem(savedItem.product, savedItem.variant, 1);
    
    // Remove from saved
    this.savedForLater.splice(savedIndex, 1);
    return this.save();
  }
  throw new Error('Item not found in saved items');
};

// Method to apply coupon
cartSchema.methods.applyCoupon = function(couponCode, discount, discountType) {
  this.appliedCoupon = {
    code: couponCode,
    discount: discount,
    discountType: discountType
  };
  return this.save();
};

// Method to remove coupon
cartSchema.methods.removeCoupon = function() {
  this.appliedCoupon = undefined;
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.appliedCoupon = undefined;
  return this.save();
};

// Method to get cart with populated products
cartSchema.methods.getPopulatedCart = function() {
  return this.populate({
    path: 'items.product',
    select: 'name images brand slug isActive variants'
  }).populate({
    path: 'savedForLater.product',
    select: 'name images brand slug isActive variants'
  });
};

// Virtual for cart total with discount
cartSchema.virtual('totalWithDiscount').get(function() {
  let total = this.subtotal;
  
  if (this.appliedCoupon) {
    if (this.appliedCoupon.discountType === 'percentage') {
      total = total * (1 - this.appliedCoupon.discount / 100);
    } else {
      total = total - this.appliedCoupon.discount;
    }
  }
  
  return Math.max(0, Math.round(total * 100) / 100);
});

// Virtual for discount amount
cartSchema.virtual('discountAmount').get(function() {
  if (!this.appliedCoupon) return 0;
  
  let discount = 0;
  if (this.appliedCoupon.discountType === 'percentage') {
    discount = this.subtotal * (this.appliedCoupon.discount / 100);
  } else {
    discount = this.appliedCoupon.discount;
  }
  
  return Math.min(discount, this.subtotal);
});

// Static method to find or create cart for user
cartSchema.statics.findOrCreateForUser = async function(userId) {
  let cart = await this.findOne({ user: userId });
  
  if (!cart) {
    cart = new this({ user: userId });
    await cart.save();
  }
  
  return cart;
};

// Static method to merge guest cart with user cart
cartSchema.statics.mergeGuestCart = async function(userId, guestCartItems) {
  const userCart = await this.findOrCreateForUser(userId);
  
  for (const guestItem of guestCartItems) {
    await userCart.addItem(
      guestItem.product,
      guestItem.variant,
      guestItem.quantity
    );
  }
  
  return userCart;
};

module.exports = mongoose.model('Cart', cartSchema);