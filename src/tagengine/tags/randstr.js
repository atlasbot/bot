module.exports = (context, [length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789']) => {
	let result = '';
	for (let i = Number.parseInt(length, 10); i > 0; i -= 1) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}

	return result;
};
