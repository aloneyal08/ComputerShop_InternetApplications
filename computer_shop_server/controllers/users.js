const User = require('../models/user');
const { encrypt } = require('../utils');
//TODO: make sure no @ in username

const register = async (req, res) => {
  const { username, password, email, phone, fullName } = req.body;
  const u = await User.findOne({email});
  if (u) {
    return res.status(400).json({ errors: ['Email already exists'] });
  }

  const user = new User({
    username,
    password: encrypt(password),
    email,
    level: 0,
    profilePhoto: '',
    phone,
    fullName
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
    password,
    ...obj
  });
    if (!user) {
      return res.status(404).json({ errors: ['User not found'] });
  }
}

const updateUser = async (req, res) => {
  const { username, password, oldPassword, email, level, profilePhoto, phone, fullName } = req.body;
  user = await User.findOne({email});
  if (!user) {
    return res.status(404).json({ errors: ['User not found'] });
  }
  if(user.password !== encrypt(oldPassword)){
    return res.status(400).json({ errors: ['Wrong password'] });
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
    return res.status(404).json({ errors: ['User not found'] });
  }
  res.send();
}

module.exports = {
  register,
  login,
  updateUser,
  deleteUser
}