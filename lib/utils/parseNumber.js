const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

module.exports = (str) => {
	if (!str || typeof str !== 'string') {
		return NaN;
	}

	if (!/[0-9]/.test(str)) {
		const index = numbers.findIndex(n => n === str.trim().toLowerCase());

		if (index !== -1) {
			return index;
		}
	} else {
		const text = str.trim().replace(/[^0-9-_.]/g, '');

		if (!isNaN(text)) {
			const number = Number(text);

			if (number > 0) {
				return number;
			}
		}
	}

	return NaN;
};
