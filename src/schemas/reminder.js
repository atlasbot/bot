const Joi = require('joi');

module.exports = {
	message: Joi.string().max(1024).required(),
	requested: Joi.date().required(),
	channel: Joi.string().required(),
	user: Joi.string().required(),
};
