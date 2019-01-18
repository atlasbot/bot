const insertMethods = ['insert'];
const updateMethods = ['update', 'findOneAndUpdate'];

const isInsert = method => insertMethods.indexOf(method) !== -1;
const isUpdate = method => updateMethods.indexOf(method) !== -1;

// adds timestamps (updatedAt, createdAt) to all documents
const addTimestamps = () => next => (args, method) => {
	if (isInsert(method)) {
		args.data.createdAt = new Date();
		args.data.updatedAt = new Date();
	}

	if (isUpdate(method)) {
		const keys = Object.keys(args.update);

		// not an operator
		const nao = keys.find(k => !k.startsWith('$'));
		if (nao) {
			// safety net, otherwise mongodb does weird things
			throw new Error(`Invalid operator "${nao}"`);
		}

		if (args.update.$set) {
			args.update.$set.updatedAt = new Date();
		} else {
			args.update.$set = {
				updatedAt: new Date(),
			};
		}
	}

	return next(args, method).then(res => res);
};

module.exports = addTimestamps;
