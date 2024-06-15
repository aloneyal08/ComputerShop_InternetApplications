const Review = require('../models/review');
const Product = require('../models/product');

const writeReview = async (req, res) => {
  const { product, user, date, text } = req.body;
  const review = new Review({
    product,
    user,
    date,
    text
  });
  await review.save();
  const reviews = await Review.find({product: product});
  let stats;
  reviews.forEach(rev => {
    stats += rev.rate;
  });
  stats = stats/stats.length;
  const _product = await Product.findOneAndDelete({product: product}, {stats: stats});
  res.json(review);
}

const getReviews = async (req, res) => {
  const { product } = req.query;
  const reviews = await Review.find({product});
  res.json(reviews);
}

const editReview = async (req, res) => {
  const { _id } = req.body;
  const review = Review.findByIdAndUpdate({_id}, {
    product,
    user,
    date,
    text
  });
  if (!review) {
    return res.status(404).json({ errors: ['Review not found'] });
  }
  res.json(review);
}

const deleteReview = async (req, res) => {
  const { _id, product, user, date, text } = req.body;
  const review = await Review.findOneAndDelete({_id});
  if (!review) {
    return res.status(404).json({ errors: ['Review not found'] });
  }
  const reviews = await Review.find({product: product});
  let stats;
  reviews.forEach(rev => {
    stats += rev.rate;
  });
  stats = stats/stats.length;
  const _product = await Product.findOneAndDelete({product: product}, {stats: stats});
  res.send();
}

module.exports = {
  writeReview,
  getReviews,
  editReview,
  deleteReview
};