const {
	TYPE_RAW,
	TYPE_CALL,
} = require('./constants');

const node = (parent, type) => ({
	parent,
	children: [],
	type,
	text: '',
});

const lex = (source) => {
	let current = node(undefined, TYPE_RAW);

	// Go down a node
	const down = (type) => {
		// create a new node with the current node as a parent
		const n = node(current, type);
		// push the new node to the current node's children
		current.children.push(n);
		// set the current node to the new child node
		current = n;
	};

	// Go up a node
	const up = () => {
		current = current.parent;
	};

	// Create a new node beside the current one
	const over = (type) => {
		// create a new node
		const n = node(current.parent, type);
		// push the new node to the current node's parent's children
		current.parent.children.push(n);
		// set the current node to the now old node's parent's new child node
		current = n;
	};

	for (let i = 0; i < source.length; i++) {
		const char = source[i];

		if (current.type === undefined) {
			current.type = source[i - 1] === '{' ? TYPE_CALL : TYPE_RAW;
		}

		if (char === '{') {
			// go down a node
			down(TYPE_CALL);
		} else if (char === '}') {
			// go up a node
			up();
			// if there are more characters, create a new node in the current's parent's parent node
			if (source[i + 1] && current.parent) {
				over();
			}
		} else if (char === ';') {
			// If the current is a regular sentence then ignore the seperator
			if (current.type === TYPE_RAW && (!current.parent && current.parent.type !== TYPE_CALL)) {
				current.text += ';';
			// if the current type is a call (a variable) go down a node
			} else if (current.type === TYPE_CALL) {
				down();
			// otherwise create a new node beside the current one
			} else {
				over();
			}
		} else {
			current.text += char;
		}
	}

	while (current.parent !== undefined) {
		up();
	}


	return current;
};

module.exports = lex;
