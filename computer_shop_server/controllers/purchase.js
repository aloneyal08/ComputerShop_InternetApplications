const Product = require('../models/product');
const Purchase = require('../models/purchase');
const User = require('../models/user');

const makePurchases = async (req, res) => {
	const { user, list} = req.body;
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
		cart.push({user, product: list[i].productId, quantity: list[i].quantity, price: p.price*(100-p.discount)/100});
	}
	const purchases = await Purchase.insertMany(cart);
	for(let i = 0; i < cart.length;++i){
		await Product.findByIdAndUpdate(cart[i].product, {stock: stocks[i] - cart[i].quantity});
	}
	const u = await User.findByIdAndUpdate(user, {cart: []});
	res.json(purchases);
};

const getPurchases = async (req, res) => {
	const {userId} = req.query;
	let filter = {user: userId}
	const purchases = await Purchase.find(filter);
	let result = [];
	for(let i = 0; i<purchases.length;i++)
	{
		let p = await Product.findById(purchases[i].product);
		result.push({date: purchases[i].date , product: p, quantity: purchases[i].quantity, price: purchases[i].price, name: purchases[i].name})
	}
	res.json(result);
};

module.exports = {
	makePurchases,
	getPurchases,
};