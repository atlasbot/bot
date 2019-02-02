module.exports = class {
	execute(...args) {
		if (args[0].includes(process.env.TOKEN)) {
			return;
		}

		console.log(...args);
	}
};
