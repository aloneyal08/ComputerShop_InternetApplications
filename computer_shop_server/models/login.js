const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Login = new Schema({
	user: {
		type: mongoose.Types.ObjectId,
		required: false
	},
	date: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('Login', Login);