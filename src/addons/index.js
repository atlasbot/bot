module.exports = {
	User: {
		tag: require('./User/tag'),
	},
	Role: {
		higherThan: require('./Role/higherThan'),
	},
	Message: {
		guild: require('./Message/guild'),
	},
	Member: {
		bannable: require('./Member/bannable'),
		highestRole: require('./Member/highestRole'),
		kickable: require('./Member/kickable'),
		punishable: require('./Member/punishable'),
		roleObjects: require('./Member/roleObjects'),
		tag: require('./Member/tag'),
	},
	Guild: {
		client: require('./Guild/client'),
		me: require('./Guild/me'),
	},
	Permission: {
		has: require('./Permission/has'),
	},
};
