const View = require('../models/view');
const Product = require('../models/product');
const { default: mongoose } = require('mongoose');

const AddView = async (req, res) => {
	const { user, product } = req.body;
	if(!mongoose.Types.ObjectId.isValid(product))
		return res.status(404).json({error: "couldn't get product"});

	const d = new Date();
	d.setHours(0,0,0,0);
	const views = await View.find({user: user}).sort({date: -1}).limit(1)

	if(views.length===0 || views[0].date < d) {
		const p = await Product.findById(product);
		if(!p){
			return res.status(400).json({error: 'Product not found'});
		}
		const view = new View({ user, product });
		await view.save();
		return res.status(200).json(view);
	}
	return res.status(200).json({})
}

const GetViews = async (req, res) => {
	const views = await View.find();
	res.status(200).json(views);
}

module.exports = {
	AddView,
	GetViews
}