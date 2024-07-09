const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = new Schema({
  title: {
    type: String,
    required: true
  },
  product : {
    type: mongoose.Types.ObjectId,
    required: true
  },
  user : {
    type: mongoose.Types.ObjectId,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', Review);