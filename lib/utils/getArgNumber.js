module.exports = (arr, {
	numOptional = true,
	defaultNumber,
} = {}) => {
	if (arr.length < 2) {
		return {
			num: defaultNumber,
			cleanedArgs: arr,
		};
	}

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
