const Review = require('../models/review');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const Tag = require('../models/tag');
const View = require('../models/view');
const { getKeywords, removeHTMLTags, dateDiff, getOverlap } = require('../utils');
const User = require('../models/user');
const { default: mongoose } = require('mongoose');
const product = require('../models/product');

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

const getProductById = async (req, res) => {
	const {id} = req.body;
	if(!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).json({error: "Couldn't get product"});

	const product = await Product.findById(id);
	if(!product){
		return res.status(404).json({error: 'Product not found'});
	}
	const s = await User.findOne({_id: product.supplier});
	if(!s || s.suspended)
		return res.status(404).json({error: "Couldn't get product"});
	res.json(product);
};

const getProducts = async (req, res) => {
	const {supplier, amount, userId} = req.query;
	const obj = {};
	if(supplier)
		obj.supplier = supplier;

	const obj2 = {}
	if(userId != 'undefined')
		obj2.user = userId;

	const allSuppliers = await User.find({level: 1});
	const products = (await Product.find(obj)).filter(p=>{
		const s = allSuppliers.find(s=>s._id.equals(p.supplier));
		return s && !s.suspended
	})
	const purchases = await Purchase.find({product: {$in: products.map(p=>p._id)}, ...obj2});
	const views = await View.find({product: {$in: products.map(p=>p._id)}, ...obj2});
	const allReviews = await Review.find({product: {$in: products.map(p=>p._id)}});
	const allTags = await Tag.find({});

	const viewsWith = views.map(view=>{
		const product = products.find(p=>p._id.equals(view.product));

		return {...view._doc, tags: product.tags, supplier: product.supplier};
	})

	const purchasesWith = purchases.map(purchase=>{
		const product = products.find(p=>p._id.equals(purchase.product));
		return {...purchase._doc, tags: product.tags, supplier: product.supplier};
	})

	const tags = allTags.map(tag=>{
		let score = 0;
		score += viewsWith.filter(view=>view.tags.includes(tag._id.toString())).length;
		score += purchasesWith.filter(pur=>pur.tags.includes(tag._id.toString())).reduce((acc, curr)=>acc+curr.quantity, 0);
		return {...tag._doc, score};
	})
	let totalTagScore = tags.reduce((acc, curr)=>acc+curr.score, 0);

	const suppliers = allSuppliers.map(supplier=>{
		let score = 0;
		score += viewsWith.filter(view=>view.supplier.equals(supplier._id)).length;
		score += purchasesWith.filter(pur=>pur.supplier.equals(supplier._id)).reduce((acc, curr)=>acc+curr.quantity, 0);
		return {...supplier._doc, score};
	});
	let totalSupplierScore = suppliers.reduce((acc, curr)=>acc+curr.score, 0);
	

	const recommendedProducts = products.map(product=>{
		const reviews = allReviews.filter(rev=>rev.product.equals(product._id));
		let rating = 0;
		reviews.forEach((rev) => {rating += rev.rating});
		if(reviews.length > 0){rating /= reviews.length;}
		else rating = 0.5;

		const myPurchases = purchases.filter(pur=>product._id.equals(pur.product));
		const myViews = views.filter(view=>product._id.equals(view.product));
		const purchaseToViewRatio = myViews.length===0 ? 0 : myPurchases.length/myViews.length;

		let tagScore = 0;
		product.tags.forEach(tag=>{
			tagScore += tags.find(t=>t._id.equals(tag)).score;
		})

		const supplierScore = suppliers.find(s=>s._id.equals(product.supplier)).score;

		const score = 0.1 * (rating/5) + 0.2*purchaseToViewRatio + (tagScore/(totalTagScore+1)) + 0.3*(supplierScore/(totalSupplierScore+1)) - (userId==="undefined" ? 0 : myPurchases.reduce((acc, curr)=>acc+curr.quantity, 0));
		return {...product._doc, score, rating};

	}).sort((a,b)=>b.score-a.score);

	res.json(recommendedProducts.slice(0, amount||50));
};

const getNewProducts = async (req, res) => {
	const {supplier, amount} = req.query;
	const obj = {};
	if(supplier)
		obj.supplier = supplier;
	
	const suppliers = await User.find({level: 1});
	const products = await (await Product.find(obj).sort({date:-1})).filter(p=>{
		const s = suppliers.find(s=>s._id.equals(p.supplier));
		return s && !s.suspended;
	});
	res.json(products.slice(0, amount||50));
};

const getPopularProducts = async (req, res) => {
	const {supplier, amount} = req.query;
	const obj = {};
	if(supplier)
		obj.supplier = supplier;

	const allSuppliers = await User.find({level: 1});
	const products = (await Product.find(obj)).filter(p=>{
		const s = allSuppliers.find(s=>s._id.equals(p.supplier));
		return s && !s.suspended
	})
	const purchases = await Purchase.find({product: {$in: products.map(p=>p._id)}});
	const allReviews = await Review.find({product: {$in: products.map(p=>p._id)}});

	const popularProducts = products.map(p=>{
		var score = 0;
		const myPurchases = purchases.filter(pur=>p._id.equals(pur.product));

		myPurchases.forEach(pur=>{
			const date = new Date(pur.date);
			const dayDiff = dateDiff(date, new Date());
			score += pur.quantity/(Math.pow(dayDiff,0.1)+1);
		});

		const reviews = allReviews.filter(rev=>rev.product.equals(p._id));
		let rating = 0;
		reviews.forEach((rev) => {rating += rev.rating});
		if(reviews.length > 0){rating /= reviews.length;}
		else rating = 0.5;

		score *= rating*rating;

		return {...p._doc, score, rating};
	}).sort((a,b)=>b.score-a.score)
	
	res.json(popularProducts.slice(0,amount||50));
};

const getLinkedProduct = async (req, res) => {
	const {supplier, product} = req.body;
	let products = await Product.find({parentProduct: null, supplier, _id: {$nin: [product]}});
	res.json(products);
}

const getAllLinked = async (req, res) => {
	const {product} = req.body;
	p = await Product.findById(product);
	let products = [];
	if(p.parentProduct !== null){
		products.push(await Product.findById(p.parentProduct));
		products = products.concat(await Product.find({parentProduct: p.parentProduct, _id: {$nin: [p._id]}}))
	} else{
		products = await Product.find({parentProduct: p._id});
	}
	res.json(products);
}

const getIsParent = async (req, res) => {
	const {id} = req.body;
	const isParent = await Product.find({parentProduct: id}).countDocuments() >= 1;
	res.json(isParent);
};

const getFlashProducts = async (req, res) => {
	const products = await Product.find({});
	const suppliers = await User.find({level: 1});

	let flash = [];
	let current = [];
	dates = [new Date(), new Date(), new Date()];
	dates[0].setHours(0, 0, 0, 0);
	dates[1].setDate(dates[1].getDate() - 7);
	dates[2].setMonth(dates[2].getMonth()-1);
	let tempList = [];
	let p = await Purchase.aggregate([{$match: {"date": {$gte: dates[0]}}}, {$group: {_id: "$product", count: {$sum: "$quantity"}}}, {$sort: {count: -1}}])

	tempList.push(p);
	p = await Purchase.aggregate([{$match: {"date": {$gte: dates[1]}}}, {$group: {_id: "$product", count: {$sum: "$quantity"}}}, {$sort: {count: -1}}]);

	tempList.push(p);
	p = await Purchase.aggregate([{$match: {"date": {$gte: dates[2]}}}, {$group: {_id: "$product", count: {$sum: "$quantity"}}}, {$sort: {count: -1}}]);

	tempList.push(p);
	tempList = tempList.map(arr=>{
		return arr.filter(pur=>{
			const p = products.find(p=>p._id.equals(pur._id));
			if(!p) return false;
			const s = suppliers.find(s=>s._id.equals(p.supplier));
			return s && !s.suspended;
		})[0]
	})

	for(let i = 0; i < tempList.length;++i){
		p = await Product.findById(tempList[i]);
		current.push(p);
	}
	flash.push(['The Most Purchased Products',
							current,
							['The Most Purchased Today','The Most Purchased This Week', 'The Most Purchased This Month'],
						'https://as1.ftcdn.net/v2/jpg/02/32/16/08/1000_F_232160874_pTqR3b5m0nny8qEOYDgd1rIbLDTDepzJ.jpg', 0.7]);
	current = [];
	p = await Product.find({date: {$gte: dates[0]}}).sort({$natural:-1});
	current.push(p);
	p = await Product.find({date: {$gte: dates[1], $lte: dates[0]}}).sort({$natural:-1});
	current.push(p);
	p = await Product.find({date: {$gte: dates[2], $lte: dates[1]}}).sort({$natural:-1});
	current.push(p);
	current = current.map(arr=>{
		return arr.filter(pur=>{
			const p = products.find(p=>p._id.equals(pur._id));
			if(!p) return false;
			const s = suppliers.find(s=>s._id.equals(p.supplier));
			return s && !s.suspended;
		})[0]
	})
	flash.push([ 'The Newest Products',
						current,
						['The Newest Today', 'The Newest This Week', 'The Newest This Month'],
						'https://img.freepik.com/free-vector/gradient-template-background-new-minimalist_483537-4981.jpg?size=626&ext=jpg&ga=GA1.1.2082370165.1716940800&semt=ais_user', 0.9]);
	current = [];
	tempList = [];
	p = await Review.aggregate([{$match: {"date": {$gte: dates[0]}}}, {$group: {_id: "$product", rate: {$avg: {$sum: "$rating"}}}}, {$sort: {rate: -1}}]);
	tempList.push(p);
	p = await Review.aggregate([{$match: {"date": {$gte: dates[1]}}}, {$group: {_id: "$product", rate: {$avg: {$sum: "$rating"}}}}, {$sort: {rate: -1}}]);
	tempList.push(p);
	p = await Review.aggregate([{$match: {"date": {$gte: dates[2]}}}, {$group: {_id: "$product", rate: {$avg: {$sum: "$rating"}}}}, {$sort: {rate: -1}}]);
	tempList.push(p);
	tempList = tempList.map(arr=>{
		return arr.filter(pur=>{
			const p = products.find(p=>p._id.equals(pur._id));
			if(!p) return false;
			const s = suppliers.find(s=>s._id.equals(p.supplier));
			return s && !s.suspended;
		})[0]
	})
	for(let i = 0; i < tempList.length;++i){
		p = await Product.findById(tempList[i]);
		current.push(p);
	}
	flash.push([ 'The Best Rated Products',
						current,
						['The Best Rated Today', 'The Best Rated This Week', 'The Best Rated This Month'],
						'https://www.welovesolo.com/wp-content/uploads/2016/03/rizbl1rx3de-1280x720.jpg', 0.6]);
	current = [];
	current = await Product.find({}).sort({"discount":-1});
	current = current.filter(p=>{
		const s = suppliers.find(s=>s._id.equals(p.supplier));
		return s && !s.suspended && p.discount > 0;
	}).slice(0, 3)
	flash.push([ 'The Biggest Sales',
							current,
							['The Number #1 Sale', 'The Number #2 Sale', 'The Number #3 Sale'],
							'https://thumb.ac-illust.com/97/973f02395b4438416829f61172c5757c_t.jpeg', 0.4]);
	res.json(flash);
};

const editProduct = async (req, res) => {
	const { _id, name, price, discount, photo, description, stock, tags, stats, parentProduct } = req.body;
	let obj = {};
	if(tags){
		obj.tags = tags;
	}
	if(stats){
		obj.stats = stats;
	}
	if(parentProduct){
		obj.parentProduct = parentProduct;
	}
	const product = await Product.findByIdAndUpdate(_id, {
		name,
		price,
		photo,
		description,
		stock,
		discount,
		...obj
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

	const purchases = await Purchase.updateMany({product: _id}, {product: null, name: product.name});
	if(!purchases){
		return res.status(404).json({ errors: ['Product not found'] });
	}
	const views = await View.deleteMany({product: _id});
	if(!views){
		return res.status(404).json({ errors: ['Product not found'] });
	}
	res.send();
};


const tagPriority = 2;
const namePriority = 1;
const descriptionPriority = 0.75;
const search = async (req, res) => {
	let { key, filters, sort} = req.headers;
	filters = JSON.parse(filters);

	const keywords = getKeywords(key);

	const Suppliers = await User.find({level: 1});
	const products = (await Product.find({})).filter(p=>{
		const s = Suppliers.find(s=>s._id.equals(p.supplier));
		return s && !s.suspended;
	})
	const tags = await Tag.find({});
	const allReviews = await Review.find();

	let searchedProducts = products.map(product=>{
		var match = 0;
		keywords.forEach(word=>{
			if(tags.find(tag=>tag.text===word&&product.tags.includes(tag._id)))
				match += tagPriority;
			else if(getKeywords(product.name).includes(word))
				match += namePriority;
			else if(getKeywords(removeHTMLTags(product.description)).includes(word))
				match += descriptionPriority;
		})

		const reviews = allReviews.filter(rev=>rev.product.equals(product._id));
		let rating = 0;
		reviews.forEach((rev) => {rating += rev.rating});
		if(reviews.length > 0){rating /= reviews.length;}
		else rating = 0.5;

		return {...product, match, rating};
	}).map(p=>({...p._doc, match:p.match, rating: p.rating})).filter(p=>p.match>0);
	
	var min=0, max=0;
	if(searchedProducts.length) {
		min = searchedProducts[0].price;
		max = searchedProducts[0].price;
		searchedProducts.forEach(p=>{
			min = Math.min(min, p.price);
			max = Math.max(max, p.price);
		});
	}
	
	const ids = [...new Set(searchedProducts.map(p=>p.supplier.toString()))];

	const suppliers = ids.map(p=>{
		const supplier = Suppliers.find(s=>s._id.toString()===p);
		return {id: supplier._id, name: supplier.fullName};
	})

	searchedProducts = searchedProducts.filter(p=>{
		var flag = false;
		filters.tags.forEach(tag=>{
			if(p.tags.includes(tag))
				flag = true;
		})
		if(!flag && filters.tags.length>0) 
			return false;

		if(filters.prices && (p.price < filters.prices[0] || p.price > filters.prices[1]))
			return false;

		if(p.rating < filters.rating)
			return false;

		if(filters.suppliers && !filters.suppliers.includes(p.supplier.toString()))
			return false;

		if(p.discount < filters.discount)
			return false;

		return true;
	})

	
	sort = Number(sort);
	if(sort === 2)
		searchedProducts.sort((a,b)=>a.price-b.price)
	else if(sort === 3)
		searchedProducts.sort((a,b)=>b.price-a.price)
	else if(sort === 4)
		searchedProducts.sort((a,b)=>b.rating-a.rating)
	else if(sort === 5)
		searchedProducts.sort((a,b)=>new Date(b.date) - new Date(a.date));
	else
		searchedProducts.sort((a,b)=>b.match-a.match)

	res.json({
		products: searchedProducts,
		price: {
			min,
			max
		},
		suppliers
	});

}

const exactSearch = async (req, res) => {
	const { key, tag, supplier } = req.headers;
	const products = await Product.find();
	

	let searchedProducts = products.filter(product=>{
		return product.name.toLowerCase().includes(key.toLowerCase())&&product.tags.includes(tag)&&product.supplier.toString()===supplier;
	});

	res.json(searchedProducts.slice(0, 50));
}


const getAutoCompletes = async (req, res) => {
	const {key} = req.headers;
	
	const tags = await Tag.find({});
	const suppliers = await User.find({level: 1});
	const products = (await Product.find({})).filter(p=>{
		const s = suppliers.find(s=>s._id.equals(p.supplier));
		return s && !s.suspended;
	})

	const recommendations = products.map(p=>p.name).filter(name=>name.toLowerCase().startsWith(key))
	const names = products.map(p=>p.name)

	const suggestions = [...new Set(names.map(n=>n.split(' ')).flat(1).concat(tags.map(t=>t.text)))].map(word=>{
		if(key.toLowerCase().includes(word.toLowerCase()))
			return {key: null, score: 0};

		const overlap = getOverlap(key, word);
		if(overlap && overlap.length > 1)
			return {key: key.replace(overlap, '') + word, score: 2 + overlap.length};

		if(key.endsWith(' '))
			return {key: key + word, score: 1}

		return {key: key + ' ' + word, score: 1}
	}).filter(word=>word.key).sort((a,b)=>b.score-a.score).map(word=>word.key);
	
	const arr = recommendations.concat(suggestions);
	res.json(arr.slice(0, 10));
}

module.exports = {
	addProduct,
	getProducts,
	getProductById,
	getNewProducts,
	getPopularProducts,
	getLinkedProduct,
	getAllLinked,
	getIsParent,
	getFlashProducts,
	editProduct,
	deleteProduct,
	search,
	exactSearch,
	getAutoCompletes
};