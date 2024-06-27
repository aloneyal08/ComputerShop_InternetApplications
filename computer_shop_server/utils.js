var CryptoJS = require("crypto-js");
require('dotenv').config()

const encrypt = (str) => {
  return CryptoJS.AES.encrypt(str, process.env.SECRET_KEY).toString();
}

const decrypt = (str) => {
  var bytes  = CryptoJS.AES.decrypt(str, process.env.SECRET_KEY);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}

module.exports = {
  encrypt,
  decrypt,
}