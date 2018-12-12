const Token = require('./Token');

/* eslint-disable eqeqeq */

module.exports = class Lexer {
	static lex(script) {
		const tokens = [];


		let content = script.split(/(\{|\}|;)/);

		content = content
			.map((t, i) => (t == '' && (content[i + 1] == '{' || content[i - 1] == '}') ? undefined : t))
			.filter(c => c !== undefined);

		for (const token of content) {
			switch (token) {
				case '{':
					tokens.push(new Token('LBRACKET', token)[0]);
					break;
				case '}':
					tokens.push(new Token('RBRACKET', token)[0]);
					break;
				case ';':
					tokens.push(new Token('SEMI', token)[0]);
					break;
				default:
					tokens.push(new Token('WORD', token)[0]);
					break;
			}
		}
		tokens.push(new Token('EOF', '')[0]);

		return tokens;
	}
};
