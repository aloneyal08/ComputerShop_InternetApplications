const mongoose = require('mongoose');
const user = require('./user');
const Schema = mongoose.Schema;


const SupplierRequest = new Schema({
  user: {
    type: Object,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: Number, // 0: Pending, 1: Accepted, 2: Rejected, 3: Cancelled
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SupplierRequest', SupplierRequest);