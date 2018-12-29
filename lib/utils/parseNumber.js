const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

// def = default
module.exports = (str, def) => {
	const ret = (val) => {
		if (isNaN(val)) {
			if (!isNaN(def)) {
				return def;
			}

			return NaN;
		}

		return val;
	};

	if (!str || typeof str !== 'string') {
		return ret(NaN);
	}

	if (!/[0-9]/.test(str)) {
		const index = numbers.findIndex(n => n === str.trim().toLowerCase());

		if (index !== -1) {
			return index;
		}
	} else {
		const text = str.trim().replace(/[^0-9-.]/g, '');

		if (!isNaN(text)) {
			const number = Number(text);

			if (number > 0) {
				return number;
			}
		}
	}

	return ret(NaN);
};
