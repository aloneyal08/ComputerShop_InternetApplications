const Review = require('../models/review');
const Product = require('../models/product');
const Purchase = require()
const productController = require('./product');

const makePurchase = async (req, res) => {
    const { user, product } = req.body;
    const date = new Date();
    const purchase = new Purchase({
        user,
        product,
        date
    });
    await purchase.save();
    const p_id = await Purchase.find({_id}).product;
    const stock = await Product.find({p_id}).stock;
    const _product = await Product.findByIdAndUpdate({p_id}, {stock: stock - 1});
    res.json(product);
};

const getPurchases = async (req, res) => {
    const {product, user} = req.query;
    let filter = product? {product}: {user};
    const purchases = await Purchase.find(filter);
    res.json(purchases);
};

const deletePurchase = async (req, res) => {
    const { _id} = req.body;
    const p_id = await Purchase.find({_id}).product;
    const stock = await Product.find({p_id}).stock;
    const product = await Product.findByIdAndUpdate({p_id}, {stock: stock + 1});
    const _purchase = await Purchase.findOneAndDelete({_id});
    if (!_product) {
      return res.status(404).json({ errors: ['Review not found'] });
    }
};

module.exports = {
    makePurchase,
    getPurchases,
    deletePurchase
};