const Product = require('../models/product');
const Purchase = require('../models/purchase');
const User = require('../models/user');

const makePurchases = async (req, res) => {
	const { user, list } = req.body;
	let cart = [], stocks = [];
	for(let i = 0;i < list.length;++i){
		const p = await Product.findOne({_id: list[i].productId});
		const s = await User.findOne({_id: p.supplier});
		if(s.suspended)
			continue;
		if(p.stock < list[i].quantity){
			return res.status(400).json({error: 'Product Out of Stock'});
		}
		stocks[i] = p.stock;
		cart.push({user, product: list[i].productId, quantity: list[i].quantity, price: p.price*(1-p.discount)});
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

module.exports = {
	makePurchases,
	getPurchases,
};