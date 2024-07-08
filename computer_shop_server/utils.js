var CryptoJS = require("crypto-js");
const User = require("./models/user");
var nodemailer = require('nodemailer');
require('dotenv').config()
var transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: 'computer.shop.colman@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  }
});


const encrypt = (str) => {
  return CryptoJS.AES.encrypt(str, process.env.SECRET_KEY).toString();
}

const decrypt = (str) => {
  var bytes  = CryptoJS.AES.decrypt(str, process.env.SECRET_KEY);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}


const userLevels = {suppliers: 1, users: 0, admins: 2}
const sendEmail = async (to, subject, header, content, buttons='') => {
  var emails = to;
  if(to === 'all') {
    const users = await User.find({});
    emails = users.map(u=>u.email).join(", ");
  }
  if(userLevels[to] !== undefined) {
    const users = await User.find({level: userLevels[to]});
    emails = users.map(u=>u.email).join(", ");
  }
  const mailOptions = {
    from: 'computer.shop.colman@gmail.com',
    to: emails,
    subject: subject,
    html: `
        <div style="background-image: url(https://us.123rf.com/450wm/panychev/panychev1603/panychev160300672/54290362-abstract-sfondo-blu-scuro.jpg?ver=6); position: absolute;width:650px;height:fit-content;padding:12px;font-family:'Franklin Gothic Medium','Arial Narrow', Arial, sans-serif;background-size: cover;display:flex;margin-left:865px;">
          <div style="background-color: #E8E8E8;position: absolute;width: 85%;height: 85%;border-radius: 44px;left: 50%;top: 50%;transform: translate(-50%, -50%);margin:auto;">
            <h2 style="font-size:15px;text-align:center;">Hello Dear Customer</h2><br/><br/>
            <h1 style="font-size:40px;text-align:center;">${header}</h1><br/><br/>
            <div style="text-align: center;font-size: 20px;font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;margin: 30px;padding:30px;">
              ${content}
              Thank You For Using Our  <a href="http://localhost:3000/">site</a>

            </div>
            ${buttons}
  
          </div>
      `
  } 
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

const getKeywords = (query) => {
  var tokens = query.toLowerCase().replace(/[^a-z0-9_\s]/g, '').split(/\s+/g);
  var keywords = tokens.map(token=>token.replace(/(ing|s)$/, ''));

  return keywords;
}

const removeHTMLTags = (html) => {
  var regX = /(<([^>]+)>)/ig;                
  return html.replace(regX, "");
}

module.exports = {
  encrypt,
  decrypt,
  sendEmail,
  getKeywords,
  removeHTMLTags,
}