module.exports = (str) => {
	let bool;

	switch (str.trim().toLowerCase()) {
		case '1':
			bool = true;
			break;
		case '0':
			bool = false;
			break;
		case 'true':
			bool = true;
			break;
		case 'false':
			bool = false;
			break;
		case 'yes':
			bool = true;
			break;
		case 'no':
			bool = false;
			break;
		default:
			bool = null;
	}

	return bool;
};
