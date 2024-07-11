const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const View = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
    required: false
  },
  product: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('View', View);