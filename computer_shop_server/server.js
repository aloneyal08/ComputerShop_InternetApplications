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
var SpellChecker = require('simple-spellchecker');
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

// other

app.get('/spell', (req, res)=>{
  const {key} = req.headers;
  SpellChecker.getDictionary("en-US", function(err, dictionary) {
    var isMisspelled = false;
    const mean = key.split(' ').map(word=>{
      var misspelled = !dictionary.spellCheck(word);
      console.log(misspelled);
      if(misspelled) {
        isMisspelled = true;
        var suggestions = dictionary.getSuggestions(word);
        return suggestions.length > 0 ? suggestions[0] : word;
      }
      return word;
    }).join(' ')
    res.json({isMisspelled, mean})
  })
})

mongoose.connection.once('open', () => {
  console.log('Server started');
  app.listen(88);
});