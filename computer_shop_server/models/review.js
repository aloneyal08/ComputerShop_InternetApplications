const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = new Schema({
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
    required: true
  }
});

module.exports = mongoose.model('Review', Review);