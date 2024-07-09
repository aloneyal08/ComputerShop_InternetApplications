const Review = require('../models/review');

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
  if(reviews.length > 0){rating /= reviews.length;}
  res.json(rating);
}

const editReview = async (req, res) => {
  const { _id, date, text, rating } = req.body;
  const review = Review.findByIdAndUpdate(_id, {
    date,
    text,
    rating
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
  res.send();
}

module.exports = {
  writeReview,
  getReviews,
  getRating,
  editReview,
  deleteReview
};