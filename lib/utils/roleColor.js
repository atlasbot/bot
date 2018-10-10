module.exports = (color) => {
	if (!color) {
		return '4f545c';
	}

	return color.toString(16).padStart(6, '0');
};
