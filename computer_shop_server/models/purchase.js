const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Purchase = new Schema({
  product : {
    type: mongoose.Mongoose.Types.ObjectId,
    required: true
  },
  user : {
    type: mongoose.Mongoose.Types.ObjectId,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
});

module.exports = mongoose.model('Purchase', Purchase);