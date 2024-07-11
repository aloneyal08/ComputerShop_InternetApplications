const SupplierRequest = require('../models/supplierRequest');
const User = require('../models/user');
const { encrypt, decrypt, sendEmail } = require('../utils');
require('dotenv').config()

const createRequest = async (req, res) => {
  const { description, username, password, email, phone, fullName } = req.body;
  var u = await User.findOne({email, status: 0});
  if (u) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  u = await User.findOne({username});
  if(u)
    return res.status(400).json({ error: 'Username already exists' });

  var requests = await SupplierRequest.find({status: 0});
  if (requests.find(r=>r.user.email===email||r.user.username===username)) {
    return res.status(400).json({ error: 'Already requested' });
  }

  const request = new SupplierRequest({
    user: {
      password: encrypt(password),
      username,
      email,
      fullName,
      phone,
      level: 1
    },
    description,
    status: 0,
  });
  await request.save();
  const admins = await User.find({level: 2});
  const obj =  Buffer.from(encrypt(JSON.stringify({id: request._id, username: admins[0].username, password: admins[0].password})), 'utf8').toString('base64');
  const cancelObj = Buffer.from(encrypt(JSON.stringify({id: request._id, password})), 'utf8').toString('base64');
  sendEmail('admins', 'Supplier Request', `Hello, ${fullName} sent a request to be a supplier.`, description, `
    <div style="margin: auto;display: flex;justify-content: center;padding: auto;">
      <a href="http://localhost:88/supplier/request/accept?obj=${obj}"><button style='display: inline-block;padding: 15px 25px;font-size: 24px;cursor: pointer;text-align: center;text-decoration: none;outline: none;color: #fff;background-color: #04AA6D;border: none;border-radius: 15px;box-shadow: 0 9px #999;margin: 10px;margin-left:137px;'>Accept</button></a>
      <a href="http://localhost:88/supplier/request/reject?obj=${obj}"><button style='display: inline-block;padding: 15px 25px;font-size: 24px;cursor: pointer;text-align: center;text-decoration: none;outline: none;color: #fff;background-color: rgb(190, 58, 58);border: none;border-radius: 15px;box-shadow: 0 9px #999;margin: 10px;'>Reject</button></a>
    </div>
  `)
  sendEmail(email, 'Supplier Request', 'Hello, you sent a request to become a supplier for our shop!',
    `if you did not make the request or wish to cancel it, press the link: <a href='http://localhost:88/supplier/request/cancel?obj=${cancelObj}'>cancel</a>`
  )
  res.status(201).json(request);
}

const acceptRequestGet = async (req, res) => {
  const { obj } = req.query;
  try {
    req.body = JSON.parse(decrypt(Buffer.from(obj, 'base64').toString('utf8')));
  } catch(error) {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Supplier Request Error</title>
          <style>
          body {
              font-family: Arial, sans-serif;
             background-color: #909099;
              padding: 20px;
           }
           .container {
            max-width: 600px;
             margin: 0 auto;
              background-color: #f0f0ff;
             padding: 30px;
              border-radius: 8px;
             box-shadow: 0 0 10px rgba(0,0,0,0.2);
           }
           h1 {
            color: #007bff;
          }
            p {
            line-height: 1.6;
            }
         </style>
       </head>
       <body>
          <div class="container">
            <h1>Couldnt Accept The Request</h1>
            <p>You dont have the permission to do this requst</p>
          </div>
        </body>
      </html>
                  `;
    return res.status(400).send(htmlContent);
  }
  return await acceptRequest(req, res);
}

const acceptRequest = async (req, res) => {
  const { id, username, password } = req.body;

  const admin = await User.findOne({ username });
  if (!admin || admin.level !== 2 || admin.password !== password) {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Supplier Request Error</title>
          <style>
          body {
              font-family: Arial, sans-serif;
             background-color: #909099;
              padding: 20px;
           }
           .container {
            max-width: 600px;
             margin: 0 auto;
              background-color: #f0f0ff;
             padding: 30px;
              border-radius: 8px;
             box-shadow: 0 0 10px rgba(0,0,0,0.2);
           }
           h1 {
            color: #007bff;
          }
            p {
            line-height: 1.6;
            }
         </style>
       </head>
       <body>
          <div class="container">
            <h1>Couldnt Accept The Request</h1>
            <p>The given request was invalid</p>
          </div>
        </body>
      </html>
                  `;
    return res.status(400).send(htmlContent);
  }

  const request = await SupplierRequest.findOneAndUpdate({ _id: id, status: 0 }, { status: 1 });
  if (!request) {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Supplier Request Error</title>
          <style>
          body {
              font-family: Arial, sans-serif;
             background-color: #909099;
              padding: 20px;
           }
           .container {
            max-width: 600px;
             margin: 0 auto;
              background-color: #f0f0ff;
             padding: 30px;
              border-radius: 8px;
             box-shadow: 0 0 10px rgba(0,0,0,0.2);
           }
           h1 {
            color: #007bff;
          }
            p {
            line-height: 1.6;
            }
         </style>
       </head>
       <body>
          <div class="container">
            <h1>Couldnt Accept The Request</h1>
            <p>Your Requst might already have been handled, please check ur email for more information!</p>
          </div>
        </body>
      </html>
                  `;
    return res.status(400).send(htmlContent);
  }

  const user = new User({ ...request.user });
  await user.save();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Supplier Request Accepted</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #909099;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #f0f0ff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }
        h1 {
          color: #007bff;
        }
        p {
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Supplier Request Accepted</h1>
        <p>Hello ${username},</p>
        <p>You Accepted The request of ${request.user.fullName} to become a supplier for our shop!</p>
      </div>
    </body>
    </html>
  `;
  res.status(201).send(htmlContent);
  sendEmail(request.user.email, 'Supplier Request Accepted', 'Hello, your request to become a supplier for our shop was accepted!', '');
}


const rejectRequestGet = async (req, res) => {
  const { obj } = req.query;
  try {
    req.body = JSON.parse(decrypt(Buffer.from(obj, 'base64').toString('utf8')));
  } catch(error) {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Supplier Request Error</title>
          <style>
          body {
              font-family: Arial, sans-serif;
             background-color: #909099;
              padding: 20px;
           }
           .container {
            max-width: 600px;
             margin: 0 auto;
              background-color: #f0f0ff;
             padding: 30px;
              border-radius: 8px;
             box-shadow: 0 0 10px rgba(0,0,0,0.2);
           }
           h1 {
            color: #007bff;
          }
            p {
            line-height: 1.6;
            }
         </style>
       </head>
       <body>
          <div class="container">
            <h1>Couldnt Reject The Request</h1>
            <p>You dont have the permission to do this requst</p>
          </div>
        </body>
      </html>
                  `;
    return res.status(400).send(htmlContent);
  }
  return await rejectRequest(req, res);
}

const rejectRequest = async (req, res) => {
  const { id, username, password } = req.body;

  const admin = await User.findOne({username});
  if(!admin || admin.level !== 2 || admin.password !== password){
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Supplier Request Error</title>
          <style>
          body {
              font-family: Arial, sans-serif;
             background-color: #909099;
              padding: 20px;
           }
           .container {
            max-width: 600px;
             margin: 0 auto;
              background-color: #f0f0ff;
             padding: 30px;
              border-radius: 8px;
             box-shadow: 0 0 10px rgba(0,0,0,0.2);
           }
           h1 {
            color: #007bff;
          }
            p {
            line-height: 1.6;
            }
         </style>
       </head>
       <body>
          <div class="container">
            <h1>Couldnt Reject The Request</h1>
            <p>You dont have the permissions to do this request</p>
          </div>
        </body>
      </html>
                  `;
    return res.status(400).send(htmlContent);
    }

  const request = await SupplierRequest.findOneAndUpdate({_id: id, status: 0}, {status: 2});

  if(!request){
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Supplier Request Error</title>
          <style>
          body {
              font-family: Arial, sans-serif;
             background-color: #909099;
              padding: 20px;
           }
           .container {
            max-width: 600px;
             margin: 0 auto;
              background-color: #f0f0ff;
             padding: 30px;
              border-radius: 8px;
             box-shadow: 0 0 10px rgba(0,0,0,0.2);
           }
           h1 {
            color: #007bff;
          }
            p {
            line-height: 1.6;
            }
         </style>
       </head>
       <body>
          <div class="container">
            <h1>Couldnt Reject The Request</h1>
            <p>Your Requst might already have been handled, please check ur email for more information!</p>
          </div>
        </body>
      </html>
                  `;
    return res.status(400).send(htmlContent);
    }
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supplier Request Rejected</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #909099;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #f0f0ff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
      }
      h1 {
        color: #007bff;
      }
      p {
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Supplier Request Rejected</h1>
      <p>Hello ${username},</p>
      <p>You Rejected The request of ${request.user.fullName} to become a supplier for our shop</p>
    </div>
  </body>
  </html>
  `;
  res.status(201).send(htmlContent);
  sendEmail(request.user.email, 'Supplier Request Rejected', 'Hello, your request to become a supplier for our shop was rejected', '')
}

const cancelRequest = async (req, res) => {
  const { obj } = req.query;
  var parsed;
  try {
    parsed = JSON.parse(decrypt(Buffer.from(obj, 'base64').toString('utf8')));
  } catch(error) {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Supplier Request Error</title>
          <style>
          body {
              font-family: Arial, sans-serif;
             background-color: #909099;
              padding: 20px;
           }
           .container {
            max-width: 600px;
             margin: 0 auto;
              background-color: #f0f0ff;
             padding: 30px;
              border-radius: 8px;
             box-shadow: 0 0 10px rgba(0,0,0,0.2);
           }
           h1 {
            color: #007bff;
          }
            p {
            line-height: 1.6;
            }
         </style>
       </head>
       <body>
          <div class="container">
            <h1>Couldnt Cancel The Request</h1>
            <p>The given request was invalid</p>
          </div>
        </body>
      </html>
                  `;
    return res.status(400).send(htmlContent);
  }
  const { id, password } = parsed;
  const request = await SupplierRequest.findOne({_id: id, status: 0});
  if(!request || decrypt(request.user.password) !== password){
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Supplier Request Error</title>
          <style>
          body {
              font-family: Arial, sans-serif;
             background-color: #909099;
              padding: 20px;
           }
           .container {
            max-width: 600px;
             margin: 0 auto;
              background-color: #f0f0ff;
             padding: 30px;
              border-radius: 8px;
             box-shadow: 0 0 10px rgba(0,0,0,0.2);
           }
           h1 {
            color: #007bff;
          }
            p {
            line-height: 1.6;
            }
         </style>
       </head>
       <body>
          <div class="container">
            <h1>Couldnt Cancel The Request</h1>
            <p>Your Requst might already have been handled, please check ur email for more information!</p>
          </div>
        </body>
      </html>
                  `;
    return res.status(400).send(htmlContent);
    }

  await SupplierRequest.findByIdAndUpdate(id, {status: 3});
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supplier Request Canceled</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #909099;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #f0f0ff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
      }
      h1 {
        color: #007bff;
      }
      p {
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Supplier Request Canceled</h1>
      <p>You Canceled Your Request to become a supplier for our shop</p>
    </div>
  </body>
  </html>
  `;
  res.status(201).send(htmlContent);
}

const getRequests = async (req, res) => {
  const requests = await SupplierRequest.find({});
  res.status(200).json(requests);
}

module.exports = {
  createRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getRequests,
  acceptRequestGet,
  rejectRequestGet,
};