const Review = require('../models/review');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const { connect } = require('mongoose');

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
	dates[0].setDate(dates[1].getDate() - 1);
	dates[1].setDate(dates[1].getDate() - 7);
	dates[2].setMonth(dates[2].getMonth()-1);
	let tempList = [];
	let p;
	/*let p = await Purchase.aggregate([{$match: {"date": {$gte: dates[0]}}}, {$group: {_id: "$product", count: {$sum:1}}}, {$sort: {count: -1}}]).limit(1);
	tempList.push(p[0]);
	p = await Purchase.aggregate([{$match: {"date": {$gte: dates[1]}}}, {$group: {_id: "$product", count: {$sum:1}}}, {$sort: {count: -1}}]).limit(1);
	tempList.push(p[0]);
	p = await Purchase.aggregate([{$match: {"date": {$gte: dates[2]}}}, {$group: {_id: "$product", count: {$sum:1}}}, {$sort: {count: -1}}]).limit(1);
	tempList.push(p[0]);
	for(let i = 0; i < tempList.length;++i){
		p = await Product.findById(tempList[i]);
		current.push(p);
	}
	flash.push(["Most Purchased", current]);
	*/
	p = await Product.find({date: {$gte: dates[0]}}).sort({$natural:-1}).limit(1);
	current.push(p[0]);
	p = await Product.find({date: {$gte: dates[1], $lte: dates[0]}}).sort({$natural:-1}).limit(1);
	current.push(p[0]);
	p = await Product.find({date: {$gte: dates[2], $lte: dates[1]}}).sort({$natural:-1}).limit(1);
	current.push(p[0]);
	flash.push(["Newest", current]);
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

module.exports = {
    addProduct,
    getProducts,
	getNewProducts,
	getPopularProducts,
	getFlashProducts,
    editProduct,
    deleteProduct
};