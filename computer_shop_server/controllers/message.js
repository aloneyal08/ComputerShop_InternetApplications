const Message = require('../models/Message');
const request = require('request')
const { sendEmail, removeHTMLTags } = require('../utils');
require('dotenv').config()
const createMessage = async (req, res) => {
	const {to, content, subject, header, from, level} = req.body;

	const message = new Message({
		from,
		level,
		to,
		content,
		subject,
		header
	});
	await message.save();
	if(to==="facebook") {
		request({
			method: "POST",
			uri: `https://graph.facebook.com/v20.0/${process.env.FACEBOOK_PAGE_ID}/feed`,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				message: header + "\n\n" + removeHTMLTags(content),
				access_token: process.env.FACEBOOK_TOKEN
			}),
		}, (error, response)=>{
			console.log(JSON.parse(response.body));
		})
	} else {
		sendEmail(to, subject, header, content, '');
	}
	res.json(message)
}

const getMessages = async (req, res) => {
	const messages = await Message.find({level: 2});
	const messages2 = await Message.find({to: 'admins'});
	res.json(messages.concat(messages2).sort(
		(a,b)=>new Date(b.date)-new Date(a.date)
	));
}

const getSupplierMessage = async (req, res) => {
	const {email} = req.query;

	const messages = await Message.find({from:email});
	const messages2 = await Message.find({to:email});
	res.json(messages.concat(messages2).sort(
		(a,b)=>new Date(b.date)-new Date(a.date)
	));
}



module.exports = {
	createMessage,
	getMessages,
	getSupplierMessage
}