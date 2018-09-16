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
