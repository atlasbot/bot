/**
 * Generates a snippet from some text.
 * @param {String} source The source string
 * @param {Object} options options
 * @param {Number} options.length The ideal length of the snippet.
 * @param {Array<string>} options.breakChars Characters to break on.
 * @param {Array<string>} options.stopChars Characters to stop on.
 * @return {String} The text snipper from <src>
 */

module.exports = (source, {
	length = 100,
	breakChars = [' ', '\n', '\r\n', '"', '<'],
	stopChars = ['.', '!', '?'],
}) => {
	const buffer = [];

	if (!source || source.length < length) {
		return source;
	}

	for (let index = 0; index < source.length; index++) {
		buffer.push(source[index]);

		if (buffer.length > length && stopChars.includes(source[index - 1]) && breakChars.includes(source[index])) {
			buffer.pop();

			break;
		}
	}

	return buffer.join('');
};
