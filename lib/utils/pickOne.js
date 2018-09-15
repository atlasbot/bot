// not actually exactly 50/50 chances but yolo
module.exports = (arr) => {
	// gets a random number between 0 and the array length
	const rand = Math.floor(Math.random() * arr.length);

	return arr[rand];
};
