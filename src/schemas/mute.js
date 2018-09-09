const Joi = require('joi');

module.exports = {
	target: Joi.string().required(),
	moderator: Joi.string().required(),
	guild: Joi.string().required(),
	reason: Joi.string().optional(),
	startedTimestamp: Joi.number().optional(),
	duration: Joi.number().required(),
	role: Joi.string().required(),
};
