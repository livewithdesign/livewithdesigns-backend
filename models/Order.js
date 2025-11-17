const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    variant: String
  }],
  shippingAddress: {
    name: {
      type: String,
      required: [true, 'Shipping name is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone is required']
    },
    street: {
      type: String,
      required: [true, 'Street is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipcode: {
      type: String,
      required: [true, 'Zipcode is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet', 'cod'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  trackingNumber: String,
  estimatedDelivery: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);