/**
 * Compares two values.
 * @param {string} p1 the first string to comprae
 * @param {string} op The operator, can be =>, ==, >, etc... - see exports.operators for a list.
 * @param {string} p2 The second string to compare.
 * @returns {boolean} If true, the first arg wins the battle. If false, the last arg. If undefined, then it's an invalid operator.
 */
module.exports = (p1, op, p2) => {
	switch (op) {
		case '==':
			return p1 == p2; // eslint-disable-line eqeqeq
		case '!=':
			return p1 != p2; // eslint-disable-line eqeqeq
		case '>=':
			return p1 >= p2;
		case '>':
			return p1 > p2;
		case '<=':
			return p1 <= p2;
		case '<':
			return p1 < p2;
		case 'startswith':
			return p1.startsWith(p2);
		case 'endswith':
			return p1.endsWith(p2);
		case 'includes':
			return p1.includes(p2);
		default:
			throw new Error(`Unknown operator "${op}"`);
	}
};

/** An array of supported operators */
module.exports.operators = [
	'==',
	'!=',
	'>=',
	'>',
	'<=',
	'<',
	'startswith',
	'endswith',
	'includes',
];
