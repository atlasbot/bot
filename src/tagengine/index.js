/*
*	Fair warning, most of this is just temporary until I get around to fixing
*	most of it. There is a 75% chance all of this will be replaced.
*/

const lexer = require('./lexer');
const interpreter = require('./interpreter');

module.exports = {
	/**
	 *
	 * @param {string} str the string to parse
	 * @param {Object} opts Options
	 * @param {Guild|Object} opts.guild The guild to get information from.
	 * @returns {Promise<Object>} The output
	 */
	async parse(str, {
		guild,
	} = {}) {
		const ast = lexer(str);
		const ret = await interpreter(ast, {
			guild,
		});

		return ret;
	},
	interpreter,
	lexer,
};
