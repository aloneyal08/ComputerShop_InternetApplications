const Tag = require('../models/tag');

const getTags = async (req, res) => {
	const tags = await Tag.find();
	res.json(tags);
};

const addTag = async (req, res) => {
	const { text, background } = req.body;
	const tag = new Tag({ text, background });
	await tag.save();

	res.json(tag);
}

const deleteTag = async (req, res) => {
	const {_id} = req.body;

	const tag = await Tag.findByIdAndDelete(_id);
	if(!tag) {
		return res.status(404).json({error: 'Tag not found'});
	}
	res.json(tag);
}

const editTag = async (req, res) => {
	const {_id, text, background} = req.body;

	const tag = await Tag.findByIdAndUpdate(_id, {text, background});
	if(!tag) {
		return res.status(404).json({error: 'Tag not found'});
	}

	res.json(tag);
}
module.exports = {
  getTags,
	addTag,
	deleteTag,
	editTag
};