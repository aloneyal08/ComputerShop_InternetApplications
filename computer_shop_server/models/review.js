const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = new Schema({
  product : {
    type: mongoose.Mongoose.Types.ObjectId,
    required: true
  },
  user : {
    type: mongoose.Mongoose.Types.ObjectId,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Review', Review);