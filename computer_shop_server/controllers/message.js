const Message = require('../models/Message');
const { sendEmail } = require('../utils');

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
  sendEmail(to, subject, header, content, '');
  res.json(message)
}

const getMessages = async (req, res) => {
  const messages = await Message.find({level: 2});
  res.json(messages);
}

const getSupplierMessage = async (req, res) => {
  const {email} = req.query;

  const messages = await Message.find({from:email});
  res.json(messages);
}



module.exports = {
  createMessage,
  getMessages,
  getSupplierMessage
}