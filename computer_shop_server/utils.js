var CryptoJS = require("crypto-js");
require('dotenv').config()

const encrypt = (str) => {
  return CryptoJS.AES.encrypt('my message', process.env.YEA2_PAI2_IA4).toString();
}

const decrypt = (str) => {
  var bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}

module.exports = {
  encrypt,
  decrypt
}