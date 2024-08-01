const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
  name : {
    type: String,
    required: true
  },
  price : {
    type: Number,
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  stats: {
    type: JSON,
    required: false
  },
  parentProduct: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  stock: {
    type: Number,
    required: true
  },
  supplier: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  tags: {
    type: JSON,
    default: []
  },
  date:{
    type: Date,
    default: Date.now
  },
  discount: {
    type: Number,
    default: 0
  },
});

module.exports = mongoose.model('Product', Product);