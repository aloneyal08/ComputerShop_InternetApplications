const SupplierRequest = require('../models/supplierRequest');
const User = require('../models/user');
const { encrypt, decrypt, sendEmail } = require('../utils');
require('dotenv').config()

const createRequest = async (req, res) => {
  const { description, username, password, email, phone, fullName } = req.body;
  var u = await User.findOne({email});
  if (u) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  u = await User.findOne({username});
  if(u)
    return res.status(400).json({ error: 'Username already exists' });

  var requests = await SupplierRequest.find({status: 0});
  if (requests.find(r=>r.user.email===email||r.user.username===username)) {
    return res.status(400).json({ error: 'Already requested' });
  }

  const request = new SupplierRequest({
    user: {
      password: encrypt(password),
      username,
      email,
      fullName,
      phone,
      level: 1
    },
    description,
    status: 0,
  });
  await request.save();
  const admins = await User.find({level: 2});
  const obj =  Buffer.from(encrypt(JSON.stringify({id: request._id, username: admins[0].username, password: admins[0].password})), 'utf8').toString('base64');
  const cancelObj = Buffer.from(encrypt(JSON.stringify({id: request._id, password})), 'utf8').toString('base64');
  sendEmail('admins', 'Supplier Request', `Hello, ${fullName} sent a request to be a supplier.`, description, `
    <div style="margin: auto;display: flex;justify-content: center;padding: auto;">
      <a href="http://localhost:88/supplier/request/accept?obj=${obj}"><button style='display: inline-block;padding: 15px 25px;font-size: 24px;cursor: pointer;text-align: center;text-decoration: none;outline: none;color: #fff;background-color: #04AA6D;border: none;border-radius: 15px;box-shadow: 0 9px #999;margin: 10px;'>Accept</button></a>
      <a href="http://localhost:88/supplier/request/reject?obj=${obj}"><button style='display: inline-block;padding: 15px 25px;font-size: 24px;cursor: pointer;text-align: center;text-decoration: none;outline: none;color: #fff;background-color: rgb(190, 58, 58);border: none;border-radius: 15px;box-shadow: 0 9px #999;margin: 10px;'>Reject</button></a>
    </div>
  `)
  sendEmail(email, 'Supplier Request', 'Hello, you sent a request to become a supplier for our shop!',
    `if you did not make the request or wish to cancel it, press the link: <a href='http://localhost:88/supplier/request/cancel?obj=${cancelObj}'>cancel</a>`
  )
  res.status(201).json(request);
}

const acceptRequestGet = async (req, res) => {
  const { obj } = req.query;
  try {
    req.body = JSON.parse(decrypt(Buffer.from(obj, 'base64').toString('utf8')));
  } catch(error) {
    return res.status(400).json({error: 'Invalid Request'});
  }
  return await acceptRequest(req, res);
}

const acceptRequest = async (req, res) => {
  const { id, username, password } = req.body;
  console.log("object");

  const admin = await User.findOne({username});
  if(!admin || admin.level !== 2 || admin.password !== password)
    return res.status(400).json({error: 'Invalid Login'});

  const request = await SupplierRequest.findByIdAndUpdate(id, {status: 1});
  if(!request) {
    return res.status(400).json({error: 'Invalid Request'});
  }

  const user = new User({...request.user})
  await user.save();
  res.status(201).json({message: 'Request accepted'});
  sendEmail(request.user.email, 'Supplier Request Accepted', 'Hello, your request to become a supplier for our shop was accepted!', '')
}

const rejectRequestGet = async (req, res) => {
  const { obj } = req.query;
  try {
    req.body = JSON.parse(decrypt(Buffer.from(obj, 'base64').toString('utf8')));
  } catch(error) {
    return res.status(400).json({error: 'Invalid Request'});
  }
  return await rejectRequest(req, res);
}

const rejectRequest = async (req, res) => {
  const { id, username, password } = req.body;

  const admin = await User.findOne({username});
  if(!admin || admin.level !== 2 || admin.password !== password)
    return res.status(400).json({error: 'Invalid Login'});

  const request = await SupplierRequest.findByIdAndUpdate(id, {status: 2});

  if(!request)
    return res.status(400).json({error: 'Request not found'});
  res.status(201).json({message: 'Request rejected'});
  sendEmail(request.user.email, 'Supplier Request Rejected', 'Hello, your request to become a supplier for our shop was rejected', '')
}

const cancelRequest = async (req, res) => {
  const { obj } = req.query;
  var parsed;
  try {
    parsed = JSON.parse(decrypt(Buffer.from(obj, 'base64').toString('utf8')));
  } catch(error) {
    return res.status(400).json({error: 'Invalid Request'});
  }
  const { id, password } = parsed;
  const request = await SupplierRequest.findById(id);
  if(!request || decrypt(request.user.password) !== password)
    return res.status(400).json({error: 'Invalid Login'});

  await SupplierRequest.findByIdAndUpdate(id, {status: 3});
  res.status(201).json({message: 'Request canceled'});
}

const getRequests = async (req, res) => {
  const requests = await SupplierRequest.find({});
  res.status(200).json(requests);
}

module.exports = {
  createRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getRequests,
  acceptRequestGet,
  rejectRequestGet,
};