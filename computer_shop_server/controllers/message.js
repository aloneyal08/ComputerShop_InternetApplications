const Message = require('../models/Message');
const { sendEmail } = require('../utils');

const createMessage = async (req, res) => {
  const {to, content, subject, header} = req.body;

  const message = new Message({
    to,
    content,
    subject,
    header
  });
  sendEmail(to, subject, header, content, '');
  res.json(message)
}

const getMessages = async (req, res) => {
  const messages = await Message.find({});
  res.json(messages);
}

module.exports = {
  createMessage,
  getMessages
}