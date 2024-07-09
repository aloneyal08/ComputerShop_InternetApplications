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
    required: false
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
    required: false
  },
  date:{
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', Product);