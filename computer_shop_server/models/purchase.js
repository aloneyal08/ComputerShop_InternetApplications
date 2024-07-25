const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Purchase = new Schema({
  product : {
    type: mongoose.Types.ObjectId,
    required: true
  },
  user : {
    type: mongoose.Types.ObjectId,
    required: true
  },
  quantity : {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  price: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Purchase', Purchase);