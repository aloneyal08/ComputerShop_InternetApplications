const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const user = require('./routers/user');
const product = require('./routers/product');
const tag = require('./routers/tag');
const review = require('./routers/review')
const message = require('./routers/message');
const supplierRequest = require('./routers/supplierRequest');
require('dotenv').config()

mongoose.connect('mongodb://0.0.0.0:27017/computerShop');

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/user', user);
app.use('/product', product);
app.use('/tag', tag);
app.use('/review', review);
app.use('/supplier/request', supplierRequest);
app.use('/message', message);

mongoose.connection.once('open', () => {
  console.log('Server started');
  app.listen(88);
});