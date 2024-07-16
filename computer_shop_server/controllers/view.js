const View = require('../models/view');
const Product = require('../models/product');

const AddView = async (req, res) => {
  const { user, product } = req.body;
  try{
    const p = await Product.findById(product);
    if(!p)
      return res.status(400).json({error: 'Product not found'});
  } catch (err) {
    return res.status(400).json(err);
  }


  const view = new View({ user, product });
  await view.save();
  res.status(200).json(view);
}

const GetViews = async (req, res) => {
  const views = await View.find();
  res.status(200).json(views);
}

module.exports = {
  AddView,
  GetViews
}