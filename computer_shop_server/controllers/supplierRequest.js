const SupplierRequest = require('../models/supplierRequest');
const User = require('../models/user');
const { encrypt, decrypt } = require('../utils');

const createRequest = async (req, res) => {
  console.log("object");
  const { description, username, password, email, phone, fullName } = req.body;
  var u = await User.findOne({email});
  if (u) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  u = await User.findOne({username});
  if(u)
    return res.status(400).json({ error: 'Username already exists' });

  const request = new SupplierRequest({
    user: {
      password: encrypt(password),
      username,
      email,
      fullName,
      phone,
      level: 1
    },
    description
  });
  await request.save();
  // TODO: send email to admin
  res.status(201).json(request);
}

module.exports = {
  createRequest
};