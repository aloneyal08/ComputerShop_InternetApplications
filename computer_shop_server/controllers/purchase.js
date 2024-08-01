const Product = require('../models/product');
const Purchase = require('../models/purchase');
const User = require('../models/user');

const makePurchases = async (req, res) => {
	const { user, list, emptyCart } = req.body;
	let cart = [], stocks = [];
	for(let i = 0;i < list.length;++i){
		const p = await Product.findOne({_id: list[i].productId});
		if(!p)
			continue;
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
	if(emptyCart) {
		const u = await User.findByIdAndUpdate(user, {cart: []});
	}
	res.json(purchases);
};

const getPurchases = async (req, res) => {
	const {userId} = req.query;
	let filter = {user: userId}
	const purchases = await Purchase.find(filter);
	let result = [];
	for(let i = 0; i<purchases.length;i++)
	{
		let p = await Product.findById(purchases[i].product) || {};
		result.push({date: purchases[i].date , product: p, quantity: purchases[i].quantity, price: purchases[i].price, name: purchases[i].name})
	}
	res.json(result);
};

const getPurchasesData = async (req, res)=>{
	const {supplier} = req.query;
	let filter = {}
	if(supplier) {
		const products = await Product.find({supplier});
		filter.product = { $in: products.map(p => p._id) }
	}
	const purchases = await Purchase.find(filter)
	let result = [];
	for(let i = 0; i<purchases.length;i++)
	{
		let p = await Product.findById(purchases[i].product) || {};
		let u = await User.findById(purchases[i].user) || {};
		result.push({...purchases[i]._doc, fullName: u.fullName, photo: p.photo, name: p.name})
	}
	res.json(result.sort((a, b) => a.date > b.date ? -1 : 1));
}

const purchaseExists = async (req, res) => {
	const {user, product} = req.query;

	const purchase = await Purchase.findOne({user, product});
	if(purchase)
		return res.json(true);

	res.json(false);
}

module.exports = {
	makePurchases,
	getPurchases,
	getPurchasesData,
	purchaseExists
};