const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  fullName: {
    type: String,
    required: true
  },
  username : {
    type: String,
    required: true
  },
  password : {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  level: {
    type: Number, // 0: user, 1: supplier, 2: admin
    required: true
  },
  profilePhoto: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  cart : {
    type: Array,
    default: []
  }
}, {strict: false});

module.exports = mongoose.model('User', User);