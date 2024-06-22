const User = require('../models/user');
const { encrypt, decrypt } = require('../utils');

const register = async (req, res) => {
  const { username, password, email, phone, fullName, profilePhoto, google } = req.body;
  var u = await User.findOne({email});
  if (u) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  u = await User.findOne({username});
  if(u && !google)
    return res.status(400).json({ error: 'Username already exists' });

  var newUsername = username;
  var count = 0;
  while(u) {
    count++;
    newUsername = username + "_" + count;
    u = await User.findOne({newUsername});
  }

  const obj = {};
  if(profilePhoto)
    obj.profilePhoto = profilePhoto;
  if(phone)
    obj.phone = phone;
  if(google)
    obj.google = true;
  const user = new User({
    username: newUsername,
    password: encrypt(password),
    email,
    level: 0,
    fullName,
    ...obj
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
    res.status(400).json({ error: 'Invalid login' });
}

const updateUserProfile = async (req, res) => {
  const { email, profilePhoto, phone, fullName } = req.body;
  var u = await User.findOne({email});
  if (!u) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = await User.findOneAndUpdate({email}, {
    profilePhoto,
    phone,
    fullName
  });
  res.json(user);
}

const updateUsername = async (req, res) => {
  const { email, username } = req.body;
  var u = await User.findOne({email});
  if (!u) {
    return res.status(404).json({ error: 'User not found' });
  }

  u = await User.findOne({username});
  if(u && u.email !== email)
    return res.status(400).json({ error: 'Username already exists' });
  
  const user = await User.findOneAndUpdate({email}, {
    username
  });
  res.json(user);
}

const updatePassword = async (req, res) => {
  const { email, password, oldPassword } = req.body;
  var u = await User.findOne({email});
  if (!u) {
    return res.status(404).json({ error: 'User not found' });
  }
  if(decrypt(u.password) !== oldPassword)
    return res.status(400).json({ error: 'Invalid old password' });

  const user = await User.findOneAndUpdate({email}, {
    password: encrypt(password)
  });
  res.json(user);
}

const deleteUser = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOneAndDelete({email});
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  //TODO: delete all user's orders, reviews, etc.

  res.json({});
}

module.exports = {
  register,
  login,
  updateUserProfile,
  updateUsername,
  updatePassword,
  deleteUser
}