const User = require('../models/user');
const { encrypt, decrypt } = require('../utils');

const register = async (req, res) => {
  const { username, password, email, phone, fullName, profilePhoto } = req.body;
  const u = await User.findOne({email});
  if (u) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const user = new User({
    username,
    password: encrypt(password),
    email,
    level: 0,
    profilePhoto: '',
    phone,
    fullName,
    profilePhoto
  });
  await user.save();
  res.status(201).json(user);
}

const login = async (req, res) => {
  const { username, password } = req.body;
  const obj = {};
  if(username.includes('@'))
    obj.email = username;
  else
    obj.username = username;
  const user = await User.findOne({
    ...obj
  });
  if(user && ((req.body.encrypted && user.password === password) || (decrypt(user.password) === password)))
    res.json(user);
  else
    res.status(404).json({ error: 'Invalid login' });
}

const updateUser = async (req, res) => {
  const { username, password, oldPassword, email, level, profilePhoto, phone, fullName } = req.body;
  user = await User.findOne({email});
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if(user.password !== encrypt(oldPassword)){
    return res.status(400).json({ error: 'Wrong password' });
  }
  const user = await User.findOneAndUpdate({email}, {
    username,
    password: encrypt(password),
    email, // TODO: check if ok to change email
    level,
    profilePhoto,
    phone,
    fullName
  });
  res.json(user);
}

const deleteUser = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOneAndDelete({email});
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.send();
}

module.exports = {
  register,
  login,
  updateUser,
  deleteUser
}