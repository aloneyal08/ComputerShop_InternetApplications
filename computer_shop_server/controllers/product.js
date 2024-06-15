const Review = require('../models/review');
const Product = require('../models/product');

const addProduct = async (req, res) => {
    const { name, price, photo, description, stats, parentProduct, stock, supplier } = req.body;
    const product = new Product({
        name,
        price,
        photo,
        description,
        stats,
        parentProduct,
        stock,
        supplier
    });
    await product.save();
    res.json(product);
};

const getProducts = async (req, res) => {
    const products = await product.find();
    res.json(products);
};

const editProduct = async (req, res) => {
    const { _id } = req.body;
    const product = Product.findByIdAndUpdate({_id}, {
        name,
        price,
        photo,
        description,
        stock
    });
    if (!product) {
      return res.status(404).json({ errors: ['Product not found'] });
    }
    res.json(product);
};

const deleteProduct = async (req, res) => {
    const { _id} = req.body;
    const _product = await Product.findOneAndDelete({_id});
    if (!_product) {
      return res.status(404).json({ errors: ['Review not found'] });
    }
    const reviews = await Review.deleteMany({product: _id});
    if(!reviews){
        return res.status(404).json({ errors: ['Review not found'] });
    }
    res.send();
};

module.exports = {
    addProduct,
    getProducts,
    editProduct,
    deleteProduct
};