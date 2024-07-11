const Product = require('../models/product');
const Purchase = require('../models/purchase');
const User = require('../models/user');

const makePurchase = async (req, res) => {
	const { user, product, quantity } = req.body;
	const stock = (await Product.findOne({_id: product})).stock;
	if(stock < quantity){
		return res.status(400).json({error: 'Product Out of Stock'});
	}
	const purchase = new Purchase({
		user,
		product,
		quantity
	});
	await purchase.save();
	await Product.findByIdAndUpdate(product, {stock: stock - quantity});
	res.json(purchase);
};

const makePurchases = async (req, res) => {
	const { user, list } = req.body;
	let cart = [], stocks = [];
	for(let i = 0;i < list.length;++i){
		const stock = (await Product.findOne({_id: list[i].productId})).stock;
		if(stock < list[i].quantity){
			return res.status(400).json({error: 'Product Out of Stock'});
		}
		stocks[i] = stock;
		cart.push({user, product: list[i].productId, quantity: list[i].quantity});
	}
	const purchases = await Purchase.insertMany(cart);
	for(let i = 0; i < cart.length;++i){
		await Product.findByIdAndUpdate(cart[i].product, {stock: stocks[i] - cart[i].quantity});
	}
	const u = await User.findByIdAndUpdate(user, {cart: []});
	res.json(purchases);
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
	const product = await Product.findByIdAndUpdate(p_id, {stock: stock + 1});
	const _purchase = await Purchase.findOneAndDelete({_id});
	if (!_product) {
	  return res.status(404).json({ errors: ['Purchase not found'] });
	}
	res.json(_purchase)
};

module.exports = {
	makePurchase,
	makePurchases,
	getPurchases,
	deletePurchase
};