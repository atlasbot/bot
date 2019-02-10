module.exports = (Eris) => {
	const oldHas = Eris.Permission.prototype.has;

	Eris.Permission.prototype.has = function has(permission) {
		// a minor personal fix, but if we can't read messages we also can't send them, so saying we can is stupid.
		if (permission === 'sendMessages' && !this.json.readMessages) {
			return false;
		}

		return oldHas.call(this, permission);
	};
};

module.exports.deps = ['Role.higherThan', 'Member.highestRole'];
