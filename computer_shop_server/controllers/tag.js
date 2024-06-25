const Tag = require('../models/tag');

const getTags = async (req, res) => {
	const tags = await Tag.find();
	res.json(tags);
};

module.exports = {
    getTags
};