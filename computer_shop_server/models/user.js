const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
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
    type: Number,
    required: true
  },
  profilePhoto: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('User', User);