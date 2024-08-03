const Review = require('../models/review');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const { default: mongoose } = require('mongoose');

const writeReview = async (req, res) => {
	const { product, user, title, text, rating } = req.body;
	const review = new Review({
		title,
		product,
		user,
		text,
		rating
	});
	await review.save();
	res.json(review);
}

const getReviews = async (req, res) => {
	const { product } = req.body;
	const reviews = await Review.find({product}).sort({$natural: -1});
	res.json(reviews);
}

const getRating = async (req, res) => {
	const {product} = req.body;
	const reviews = await Review.find({product});
	let rating = 0;
	reviews.forEach((rev) => {rating += rev.rating});
	if(reviews.length > 0){
		rating /= reviews.length;
	} else {
		rating = 0.5;
	}
	res.json(rating);
}

const getSupplierRating = async (req, res) => {
	const {supplier} = req.query;
	if(!mongoose.Types.ObjectId.isValid(supplier))
		return res.status(404).json({error: 'Supplier not found'});
	const products = await Product.find({supplier});
	let sRating = 0, count = 0;
	for(let i = 0;i < products.length; ++i){
		const reviews = await Review.find({product: products[i]._id});
		if(reviews.length <= 0){continue;}
		let rating = 0;
		reviews.forEach((rev) => {rating += rev.rating});
		rating /= reviews.length;
		sRating += rating;
		++count;
	}
	if(count > 0){
		sRating /= count;
	}else{
		sRating = 0.5;
	}
	res.json(sRating);
};

const canReview = async (req, res) => {
	const {product, user} = req.query;
	const review = await Review.find({product, user});
	const purchases = await Purchase.find({product, user});
	if(purchases.length - review.length > 0)
		return res.json(true);
	res.json(false);
}

module.exports = {
	writeReview,
	getReviews,
	getRating,
	getSupplierRating,
	canReview
};