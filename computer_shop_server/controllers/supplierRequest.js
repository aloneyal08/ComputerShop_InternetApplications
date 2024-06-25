const SupplierRequest = require('../models/supplierRequest');
const User = require('../models/user');
const { encrypt, decrypt } = require('../utils');

var AWS = require("aws-sdk");
AWS.config.update({region:'us-east-1'});

const createRequest = async (req, res) => {
  const { description, username, password, email, phone, fullName } = req.body;
  var u = await User.findOne({email});
  if (u) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  u = await User.findOne({username});
  if(u)
    return res.status(400).json({ error: 'Username already exists' });

  const request = new SupplierRequest({
    user: {
      password: encrypt(password),
      username,
      email,
      fullName,
      phone,
      level: 1
    },
    description
  });
  await request.save();
  const admins = await User.find({level: 2}, {email: 1, _id: 0});
  console.log(admins);
  var params = {
    Destination: {
      ToAddresses: admins.map(admin=>admin.email)
    },
    Message: {
      Body: {
        Html: {
        Charset: "UTF-8",
        Data: `
          <style>
            button {
              display: inline-block;
              padding: 15px 25px;
              font-size: 24px;
              cursor: pointer;
              text-align: center;
              text-decoration: none;
              outline: none;
              color: #fff;
              background-color: #04AA6D;
              border: none;
              border-radius: 15px;
              box-shadow: 0 9px #999;
              margin: 10px;
            }

            button:hover {background-color: #3e8e41}

            button:active {
              background-color: #3e8e41;
              box-shadow: 0 5px #666;
              transform: translateY(4px);
            }
            .rejectButton {
              background-color: rgb(190, 58, 58);
            }
            .rejectButton:hover {
              background-color: darkred;
            }
          
          </style>
          <div style="background-image: url(https://us.123rf.com/450wm/panychev/panychev1603/panychev160300672/54290362-abstract-sfondo-blu-scuro.jpg?ver=6); position: absolute;width: 100%;height: 100%;font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;background-size: cover;">
            <div style="background-color: white;position: absolute;width: 85%;height: 85%;border-radius: 44px;left: 50%;top: 50%;transform: translate(-50%, -50%);">
              <h1 style="font-size: 50px;text-align: center;">Hello, ${fullName} sent a request to be a supplier.</h1>
              <p style="text-align: center;font-size: 20px;font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;margin: 30px;">
                ${description}
              </p>
              <div style="margin: auto;display: flex;justify-content: center;">
                <button onclick='accept()'>Accept</button>
                <button onclick='reject()' class="rejectButton">Reject</button>
              </div>
            </div>
          </div>
          <script>
            const accept = () => {
              fetch('http://localhost:3000/supplier/request/accept', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: '${email}',
                }),
              })
            }
            const reject = () => {
              fetch('http://localhost:3000/supplier/request/reject', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: '${email}',
                }),
              })
            }
          </script>
        `
        },
      },
      Subject: {Charset: 'UTF-8',Data: 'Supplier Request: ' + fullName}
    },
    Source: 'computer.shop.colman@gmail.com',
    ReplyToAddresses: ['computer.shop.colman@gmail.com',],
  };
  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

  sendPromise.then(function(data) {
    res.json("true")
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });

  res.status(201).json(request);
}

module.exports = {
  createRequest
};