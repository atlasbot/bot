module.exports = (Eris) => {
	Eris.Role.prototype.higherThan = function higherThan(role2) {
		if (this.position === role2.position) {
			return role2.id - this.id > 0;
		}

		return this.position - role2.position > 0;
	};
};
