const Joi = require('joi');

module.exports = {
	color: Joi.number(),
	title: Joi.string().max(256),
	description: Joi.string().max(2048).allow([true, false, null, '']),
	fields: Joi.array().items({
		name: Joi.string().max(256),
		value: Joi.alternatives([
			Joi.string().max(1024),
			Joi.number(),
			Joi.boolean(),
		]).required(),
		inline: Joi.boolean(),
	}).max(25),
	footer: {
		text: Joi.string().max(2048).allow(null),
	},
	author: {
		name: Joi.string().max(256),
		icon_url: Joi.string().uri({ scheme: ['http', 'https', 'attachment'] }).allow([true, false, null]),
	},
	url: Joi.string().uri().allow(null),
	image: {
		url: Joi.string().uri({ scheme: ['http', 'https', 'attachment'] }).allow([true, false, null]),
	},
	thumbnail: {
		url: Joi.string().uri({ scheme: ['http', 'https', 'attachment'] }).allow([true, false, null]),
	},
	timestamp: Joi.date().timestamp().allow([true, false, null]),
};
