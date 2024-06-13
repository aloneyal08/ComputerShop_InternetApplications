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
    required: false
  },
  description: {
    type: String,
    required: false
  },
  stats: {
    type: JSON,
    required: false
  },
  parentProduct: {
    type: mongoose.Mongoose.Types.ObjectId,
    required: false
  },
  stock: {
    type: Number,
    required: true
  },
  supplier: {
    type: mongoose.Mongoose.Types.ObjectId,
    required: true
  }
});

module.exports = mongoose.model('Product', Product);