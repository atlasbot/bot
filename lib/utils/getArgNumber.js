/**
 * Gets a number from the end of an array (if any). For example, 'awd something 10' would get "10"
 * @param {Array<string>} arr An array of arguments.
 * @param {Object} opts options
 * @param {boolean} opts.numOptional If set, when no number is found it will still return the array
 * @param {number} opts.defaultNumber The default number if none is found.
 * @returns {Object} the data
 */
module.exports = (arr, {
	numOptional = true,
	defaultNumber,
} = {}) => {
	const ending = arr.pop();
	if (!isNaN(ending)) {
		return {
			num: Number(ending),
			cleanedArgs: arr,
		};
	}

	if (numOptional) {
		arr.push(ending);

		return {
			cleanedArgs: arr,
			num: defaultNumber,
		};
	}
};
