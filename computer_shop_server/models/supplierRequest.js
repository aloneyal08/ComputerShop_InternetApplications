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
  }
});

module.exports = mongoose.model('SupplierRequest', SupplierRequest);