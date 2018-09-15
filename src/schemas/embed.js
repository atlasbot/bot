const Joi = require('joi');

module.exports = {
	color: Joi.number().optional(),
	title: Joi.string().max(256).optional(),
	description: Joi.string().max(2048).optional(),
	fields: Joi.array().items({
		name: Joi.string().max(256).optional(),
		value: Joi.string().max(1024).required(),
		inline: Joi.boolean().optional(),
	}).max(25)
		.unique()
		.optional(),
	footer: {
		text: Joi.string().max(2048).allow(null).optional(),
	},
	author: {
		name: Joi.string().max(256).optional(),
		icon_url: Joi.string().optional().uri({ scheme: ['http', 'https'] }),
	},
	url: Joi.string().uri(),
	image: {
		url: Joi.string().optional().uri({ scheme: ['http', 'https'] }),
	},
	thumbnail: {
		url: Joi.string().optional().uri({ scheme: ['http', 'https'] }),
	},
	timestamp: Joi.date().timestamp(),
};
