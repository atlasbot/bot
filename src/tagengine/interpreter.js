const fs = require('fs').promises;
const path = require('path');
const {
	TYPE_RAW,
	TYPE_CALL,
} = require('./constants');

const tagAliases = new Map();
const tags = new Map();

const TAG_DIR = path.join(__dirname, 'rich');

fs.readdir(TAG_DIR)
	.then((files) => {
		files.forEach((f) => {
			const tag = require(path.join(TAG_DIR, f));
			tags.set(tag.info.name, tag);
			tag.info.aliases.forEach((a) => {
				tagAliases.set(a, tag.info.name);
			});
		});
	});

const interpret = async (ast, context = {}, uses = {}, errors = []) => {
	let output = '';

	const iterate = async (list) => {
		if (list.length === 0) {
			return [];
		}
		const iterator = list[Symbol.iterator]();
		const values = [];
		try {
			for (const child of iterator) {
				const out = await interpret(child, context, uses, errors);
				values.push(out.output);
			}
		} catch (e) {
			return [];
		}

		return values;
	};

	if (ast.type === TYPE_RAW) {
		output += ast.text;
		if (ast.children.length > 0) {
			output += (await iterate(ast.children)).join('');
		}
	} else if (ast.type === TYPE_CALL) {
		const label = ast.text.trim().toLowerCase();
		// todo:: handle if/else tags properly
		const args = await iterate(ast.children);
		const tag = tags.get(label) || tagAliases.get(label);
		if (tag) {
			// todo: give the variable access to guild/user info
			// todo: make sure it doesn't go over the limit
			// even if there is an error, so meh
			try {
				const ret = await tag.handler(args);
				if (ret) {
					output += ret;
				}
			} catch (e) {
				errors.push(e);
			}
		}
	}

	if (errors.length !== 0) {
		// TODO: log errors in the guilds error log channel
	}

	return {
		output,
		errors,
		uses,
	};
};

module.exports = interpret;
