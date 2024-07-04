const Review = require('../models/review');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const Tag = require('../models/tag');
const { connect } = require('mongoose');
const { getKeywords, removeHTMLTags } = require('../utils');

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
		date: new Date().toISOString(),
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

const getFlashProducts = async (req, res) => {
	let flash = [];
	let current = [];
	dates = [new Date(), new Date(), new Date()];
	dates[0].setDate(dates[0].getDate() - 1);
	dates[1].setDate(dates[1].getDate() - 7);
	dates[2].setMonth(dates[2].getMonth()-1);
	let tempList = [];
	let p = await Purchase.aggregate([{$match: {"date": {$gte: dates[0]}}}, {$group: {_id: "$product", count: {$sum:1}}}, {$sort: {count: -1}}]).limit(1);
	tempList.push(p[0]);
	p = await Purchase.aggregate([{$match: {"date": {$gte: dates[1]}}}, {$group: {_id: "$product", count: {$sum:1}}}, {$sort: {count: -1}}]).limit(1);
	tempList.push(p[0]);
	p = await Purchase.aggregate([{$match: {"date": {$gte: dates[2]}}}, {$group: {_id: "$product", count: {$sum:1}}}, {$sort: {count: -1}}]).limit(1);
	tempList.push(p[0]);
	for(let i = 0; i < tempList.length;++i){
		p = await Product.findById(tempList[i]);
		current.push(p);
	}
	flash.push(["Most Purchased", current, 'https://media.istockphoto.com/id/826661764/video/falling-dollar-banknotes-in-4k-loopable.jpg?s=640x640&k=20&c=VkMeB7CyxyI96uGVnRuJLg5mI4AHlVVlc9DsT6jMA0Q=']);
	p = await Product.find({date: {$gte: dates[0]}}).sort({$natural:-1}).limit(1);
	current.push(p[0]);
	p = await Product.find({date: {$gte: dates[1], $lte: dates[0]}}).sort({$natural:-1}).limit(1);
	current.push(p[0]);
	p = await Product.find({date: {$gte: dates[2], $lte: dates[1]}}).sort({$natural:-1}).limit(1);
	current.push(p[0]);
	flash.push(["Newest", current, 'https://img.freepik.com/free-vector/bokeh-lights-glitter-background_1048-8548.jpg']);
	/*
	current = [];
	tempList = [];
	p = await Review.aggregate([{$match: {"date": {$gte: dates[0]}}}, {$group: {_id: "$product", count: {$sum:1}}}, {$sort: {count: -1}}]).limit(1);
	tempList.push(p);
	p = await Review.aggregate([{$match: {"date": {$gte: dates[1]}}}, {$group: {_id: "$product", count: {$sum:1}}}, {$sort: {count: -1}}]).limit(1);
	tempList.push(p);
	p = await Review.aggregate([{$match: {"date": {$gte: dates[2]}}}, {$group: {_id: "$product", count: {$sum:1}}}, {$sort: {count: -1}}]).limit(1);
	tempList.push(p);
	console.log(tempList);
	*/
	res.json(flash);
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


const tagPriority = 2;
const namePriority = 1;
const descriptionPriority = 0.75;
const search = async (req, res) => {
	const {key} = req.headers;
	const keywords = getKeywords(key);

	const products = await Product.find({});
	const tags = await Tag.find({})

	const searchedProducts = products.map(product=>{
		var match = 0;
		keywords.forEach(word=>{
			if(tags.find(tag=>tag.text===word&&product.tags.includes(tag._id)))
			 	match += tagPriority;
			else if(getKeywords(product.name).includes(word))
				match += namePriority;
			else if(getKeywords(removeHTMLTags(product.description)).includes(word))
				match += descriptionPriority;
		})
		return {...product, match};
	}).map(p=>({...p._doc, match:p.match})).sort((a,b)=>b.match-a.match).filter(p=>p.match>0).slice(0, 50);

	res.json(searchedProducts);

}

module.exports = {
	addProduct,
	getProducts,
	getNewProducts,
	getPopularProducts,
	getFlashProducts,
	editProduct,
	deleteProduct,
	search
};