const Product = require('../models/product');
const Purchase = require('../models/purchase');

const makePurchase = async (req, res) => {
	const { user, product, quantity } = req.body;
	const p = await Product.findOne({_id: product});
	if(p.stock < quantity){
		return res.status(400).json({error: 'Product Out of Stock'});
	}
	const purchase = new Purchase({
		user,
		product,
		quantity,
		price: p.price*(1-p.discount)
	});
	await purchase.save();
	const _product = await Product.findByIdAndUpdate(product, {stock: p.stock - quantity});
	res.json(purchase);
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
	getPurchases,
	deletePurchase
};