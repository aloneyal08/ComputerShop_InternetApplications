const Review = require('../models/review');
const Product = require('../models/product');

const addProduct = async (req, res) => {
	const { name, price, photo, description, stats, parentProduct, stock, supplier, tags } = req.body;
	let obj = {};
	if(photo){
		obj.photo = photo;
	}
	if(stats){
		obj.stats = stats;
	}
	if(parentProduct){
		obj.parentProduct = parentProduct;
	}
	if(tags){
		obj.tags = tags;
	}
	const product = new Product({
		name,
		price,
		stock,
		supplier,
		description,
		...obj
	});
	await product.save();
	res.json(product);
};

const getProducts = async (req, res) => {
	const products = await Product.find();
	res.json(products);
};

const getNewProducts = async (req, res) => {
	const products = await Product.find().sort({$natural:-1});
	res.json(products);
};

const getPopularProducts = async (req, res) => {
	const products = await Product.find();
	res.json(products);
};

const editProduct = async (req, res) => {
	const { _id, name, price, photo, description, stock } = req.body;
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
		return res.status(404).json({ errors: ['Product not found'] });
	}
	const reviews = await Review.deleteMany({product: _id});
	if(!reviews){
		return res.status(404).json({ errors: ['Product not found'] });
	}
	res.send();
};

module.exports = {
    addProduct,
    getProducts,
	getNewProducts,
	getPopularProducts,
    editProduct,
    deleteProduct
};