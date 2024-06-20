const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const user = require('./routers/user');
const product = require('./routers/product')
require('dotenv').config()

mongoose.connect('mongodb://0.0.0.0:27017/computerShop',
    { useNewUrlParser: true, useUnifiedTopology: true });

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/user', user);
app.use('/product', product);
mongoose.connection.once('open', () => {
  console.log('Server started');
  app.listen(88);
});