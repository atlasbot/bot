// https://stackoverflow.com/questions/35948335/how-can-i-check-if-two-map-objects-are-equal

module.exports = (map1, map2) => {
	let testVal;
	// modified for atlas incase values are changed and the map isn't
	// if (map1.size !== map2.size) {
	// 	return false;
	// }

	for (const [key, val] of map1) {
		testVal = map2.get(key);
		// in cases of an undefined value, make sure the key
		// actually exists on the object so there are no false positives
		if (testVal !== val || (testVal === undefined && !map2.has(key))) {
			return false;
		}
	}

	return true;
};
