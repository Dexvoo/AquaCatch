const { Schema, model } = require('mongoose');

const FishDrops = new Schema({
	guild: {
		type: String,
		required: true,
	},
	channel: {
		type: String,
		required: true,
	},
});

module.exports = model('Guild-Fish-Drops', FishDrops);
