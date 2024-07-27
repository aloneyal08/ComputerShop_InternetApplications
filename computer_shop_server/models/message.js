const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = new Schema({
	from: {
		type: String,
		required: true
	},
	level: {
		type: Number, // user level
		required: true
	},
	to: {
		type: String,
		required: true
	},
	subject: {
		type: String,
		required: true
	},
	header: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Message', Message);