const capitalize = require('./capitalize');

const special = {
	hongkong: 'Hong Kong',
	southafrica: 'South Africa',
};

/**
 * Formats a region to a human readable region, e.g "us-west" to "US West" or "hongkong" to "Hong Kong"
 * @param {string} str The region to format, e.g "eu-central" or "sydney"
 * @returns {string} The formatted region, e.g "Central Europe" or "Sydney"
 */
module.exports = (str) => {
	let region = str;

	if (special[region]) {
		region = special[region];
	}

	return region
	// "eu-central" => "Central Europe"
		.replace(/eu-([A-z]+)/ig, (a, b) => `${b} Europe`)
	// "us" => "US"
		.split('us')
		.join('US')
	// "-" => " " & "sydney" => "Sydney" (capitalization)
		.split('-')
		.map(capitalize)
		.join(' ');
};
