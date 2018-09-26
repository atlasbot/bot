module.exports = (channel) => {
	switch (channel) {
		case 0:
			return 'text';
		case 1:
			return 'dm';
		case 2:
			return 'voice';
		case 3:
			return 'group dm';
		case 4:
			return 'category';
		default:
			return 'text';
	}
};
