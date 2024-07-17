const User = require('../models/user');
const Tag = require('../models/tag');
const Product = require('../models/product');
const Review = require('../models/review');
const Purchase = require('../models/purchase');
const View = require('../models/view');
const Login = require('../models/login');

const { encrypt, decrypt } = require('../utils');


const getUserById = async (req, res) => {
  const {id} = req.body;
  var u = await User.findById(id);
  if(!u){
    return res.status(404).json({error: 'User does not exist'});
  }
  return res.json(u);
}

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
  if(user && ((req.body.encrypted && user.password === password) || (decrypt(user.password) === password))){
    if(user.suspended) {
      return res.status(400).json({ error: 'Your account is suspended. if you need more details, please contact our admins at: computer.shop.colman@gmail.com' });
    }
    const d = new Date();
    d.setHours(0,0,0,0);
    const logins = await Login.find({user: user._id}).sort({date: -1}).limit(1)
    if(logins.length===0 || logins[0].date < d) {
      const l = new Login({user: user._id});
      await l.save();
    }
    return res.json(user);
  }
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
  const { email, password, oldPassword, oldPassEnc } = req.body;
  var u = await User.findOne({email});
  if (!u) {
    return res.status(404).json({ error: 'User not found' });
  }
  if((oldPassEnc ? u.password : decrypt(u.password)) !== oldPassword)
    return res.status(400).json({ error: 'Invalid old password' });

  const user = await User.findOneAndUpdate({email}, {
    password: encrypt(password)
  });
  res.json(user);
}

const updateCart = async (req, res) => {
  const {email, cart} = req.body;
  const u = await User.findOneAndUpdate({email}, {cart});
  res.json(u);
};

const addToCart = async (req, res) => {
  const {email, addition} = req.body;
  let cart = (await User.findOne({email})).cart;
  for(let i = 0; i < cart.length;++i){
    if(cart[i].productId == addition.productId){
      return res.status(400).json({error: 'Product Already in Cart'})
    }
  }
  cart.push(addition)
  const u = await User.findOneAndUpdate({email}, {
    cart
  });
  res.json(u);
};
const updateBackground = async (req, res) => {
  const { email, background } = req.body;
  var u = await User.findOne({email});
  if (!u) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = await User.findOneAndUpdate({email}, {background});
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

const getSuppliers = async (req, res) => {
  const suppliers = await User.find({level: 1});
  res.json(suppliers);
}

const getAdmins = async (req, res) => {
  const admins = await User.find({level: 2});
  res.json(admins);
}

const suspendAccount = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOneAndUpdate({email}, {suspended: 1})
  res.json(user)
}

const restoreAccount = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOneAndUpdate({email}, {$unset: {suspended: 1}});
  res.json(user);
}

const getAllEmails = async (req, res) => {
  const {onlyUser} = req.query;
  const users = await User.find(onlyUser ? {level: 0} : {}, {email: 1});
  res.json(users.map(u=>u.email));
}

const addAdmin = async (req, res) => {
  const {email, username, password} = req.body;
  const mainAdmin = await User.findOne({username});
  if(!mainAdmin || mainAdmin.level !== 2 || mainAdmin.password !== password)
    return res.status(400).json({error: 'Invalid credentials'});

  const admin = await User.findOneAndUpdate({email}, {level: 2});
  res.json(admin);
}

const getSupplier = async (req, res) => {
  const {id} = req.query;
  try{
    const supplier = await User.findById(id);
    if(!supplier || supplier.level !== 1)
      return res.status(404).json({error: 'Supplier not found'});
    delete supplier.password;

    const tags = await Tag.find({});

    const products = await Product.find({supplier: id});

    const supplierTags = tags.filter(tag=>products.find(p=>p.tags.map(t=>t.toString()).includes(tag._id.toString()))).map(tag=>({text: tag.text, _id: tag._id}));

    res.json({supplier, tags: supplierTags});
  } catch(e) {
    res.status(404).json({error: 'Supplier not found'});
  }
}

const getSupplierProducts = async (req, res) => {
  const { id, sort } = req.query;

  let products = await Product.find({supplier: id}, {name: 1, price: 1, photo: 1});
  const purchases = await Purchase.find({product: {$in: products.map(p=>p._id)}});

  let result = products.map(p=>{
    amount = 0;
    const ps = purchases.filter(pur=>p._id.equals(pur.product));
    ps.forEach(p2=>amount+=p2.quantity);
    return {...p._doc, purchases: amount};
  })
  
  result.sort((a,b)=>{
    if(Number(sort)===1) {
      return b.purchases - a.purchases;
    } else if (Number(sort) === 3)
      return a.price - b.price;
    
    return a.name.localeCompare(b.name); 
  })

  res.json(result);
}

const getDateJump = (timeFrame, d) => {
  var date = new Date(d);
  if(timeFrame==="year")
    date.setMonth(date.getMonth() + 1);
  else if(timeFrame==="month")
    date.setDate(date.getDate() + 7);
  else if(timeFrame==="week")
    date.setDate(date.getDate() + 1);
  return date;
}

const supplierRatingOverTime = async (req, res) => {
  const {id, startDate, endDate, timeFrame, product} = req.body;
  const obj = {};
  if(id)
    obj.supplier = id;
  if(product)
    obj._id = product;
  const products = await Product.find({...obj});
  const reviews = await Review.find({product: {$in: products.map(p=>p._id)}});
  var arr = [];
  
  for(var date = new Date(startDate); date <= new Date(endDate);) {
    const myReviews = reviews.filter(r=>new Date(r.date) <= date);
    if(myReviews.length === 0) {
      arr.push([new Date(date), 0]);
    } else {
      let rating = 0;
      myReviews.forEach((rev) => {rating += rev.rating});
      rating /= myReviews.length;
      arr.push([new Date(date), rating])
    }
    
    date = getDateJump(timeFrame, date);
  }

  res.json(arr);
}

const supplierPurchasesOverTime = async (req, res) => {
  const {id, startDate, endDate, timeFrame, product, type} = req.body;

  const suppliers = await User.find({level: 1});
  var s = [];
  if(id)
    s = [id]
  else
    s = suppliers.map(s=>s._id);


  const data = await Promise.all(s.map(async (supplierId, i)=>{
    const obj = {}
    if(product)
      obj._id = product;
    const products = await Product.find({...obj, supplier: supplierId});
    const purchases = await Purchase.find({product: {$in: products.map(p=>p._id)}, date: {$gte: new Date(startDate), $lt: new Date(endDate)}});
    var arr = [];
    
    for(var date = new Date(startDate); date <= new Date(endDate);) {
      const nextDate = getDateJump(timeFrame, date);
      const myPurchases = purchases.filter(r=>new Date(r.date) >= date && new Date(r.date) < nextDate);
      
      let sum = 0;
      if(type === 'money')
        myPurchases.forEach((p) => {sum += p.quantity*p.price});
      else
        myPurchases.forEach((p) => {sum += p.quantity});
      arr.push([new Date(date), sum, supplierId, suppliers.find(s=>s._id.equals(supplierId)).fullName])
  
      date = nextDate;
    }

    return arr;
  }))
  res.json(data.flat(1));

}

const supplierViewsOverTime = async (req, res) => {
  const {id, startDate, endDate, timeFrame, product} = req.body;
  const obj = {};
  if(id)
    obj.supplier = id;
  if(product)
    obj._id = product;
  const products = await Product.find({...obj});
  const views = await View.find({product: {$in: products.map(p=>p._id)}, date: {$gte: new Date(startDate), $lt: new Date(endDate)}});
  var arr = [];
  
  for(var date = new Date(startDate); date <= new Date(endDate);) {
    const nextDate = getDateJump(timeFrame, date);
    const myViews = views.filter(r=>new Date(r.date) >= date && new Date(r.date) < nextDate);
    arr.push([new Date(date), myViews.length])

    date = nextDate;
  }
  res.json(arr);
}

const supplierPurchasesToViewRatioOverTime = async (req, res) => {
  const {id, startDate, endDate, timeFrame, product, type} = req.body;
  const obj = {};
  if(id)
    obj.supplier = id;
  if(product)
    obj._id = product;
  const products = await Product.find({...obj});
  const purchases = await Purchase.find({product: {$in: products.map(p=>p._id)}, date: {$gte: new Date(startDate), $lt: new Date(endDate)}});
  const views = await View.find({product: {$in: products.map(p=>p._id)}, date: {$gte: new Date(startDate), $lt: new Date(endDate)}});
  var arr = [];
  
  for(var date = new Date(startDate); date <= new Date(endDate);) {
    const nextDate = getDateJump(timeFrame, date);
    const myPurchases = purchases.filter(r=>new Date(r.date) >= date && new Date(r.date) < nextDate);
    const myViews = views.filter(r=>new Date(r.date) >= date && new Date(r.date) < nextDate);

    let sum = 0;

    if(type === 'money')
      myPurchases.forEach((p) => {sum += p.quantity*p.price});
    else
      myPurchases.forEach((p) => {sum += p.quantity});



    arr.push([new Date(date), myViews.length===0 ? 0 : sum/myViews.length])

    date = nextDate;
  }
  res.json(arr);
}

const getUserNumbers = async (req, res) => {
  const users = await User.find({});
  
  res.json([
    {name: 'Admins', value: users.filter(u=>u.level===2).length},
    {name: 'Suppliers', value: users.filter(u=>u.level===1).length},
    {name: 'Google Users', value: users.filter(u=>u.google&&u.level===0).length},
    {name: 'Users', value: users.filter(u=>!u.google&&u.level===0).length}
  ])
};

const getLoginsOverTime = async (req, res) => {
  const {startDate, endDate, timeFrame, product} = req.body;
  const logins = await Login.find({date: {$gte: new Date(startDate), $lt: new Date(endDate)}});
  var arr = [];
  
  for(var date = new Date(startDate); date <= new Date(endDate);) {
    const nextDate = getDateJump(timeFrame, date);
    const myLogins = logins.filter(r=>new Date(r.date) >= date && new Date(r.date) < nextDate);
    arr.push([new Date(date), myLogins.length])

    date = nextDate;
  }
  res.json(arr);
}

module.exports = {
  getUserById,
  getSuppliers,
  register,
  login,
  updateUserProfile,
  updateUsername,
  updatePassword,
  updateCart,
  addToCart,
  updateBackground,
  deleteUser,
  getAdmins,
  suspendAccount,
  restoreAccount,
  getAllEmails,
  addAdmin,
  getSupplier,
  getSupplierProducts,
  supplierRatingOverTime,
  supplierPurchasesOverTime,
  supplierViewsOverTime,
  supplierPurchasesToViewRatioOverTime,
  getUserNumbers,
  getLoginsOverTime
}