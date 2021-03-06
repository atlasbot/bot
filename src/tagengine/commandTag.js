const Message = require('eris/lib/structures/Message');
const Permission = require('eris/lib/structures/Permission');
const { Permissions } = require('eris/lib/Constants');

const RETURN_ID_REGEX = /--?returnId((?:=)?('|")true('|"))?/;

module.exports = (command, rawCtx) => ({
	execute: async (context, args = []) => {
		// eslint-disable-next-line prefer-const
		let { settings, user, msg, member, label = command.info.name } = context;

		let returnId = false;

		const argIndex = args.findIndex(a => RETURN_ID_REGEX.test(a));

		if (argIndex !== -1) {
			args.splice(argIndex, 1);

			returnId = true;
		}

		// hack to get tags working in dm's
		if (!context.channel.permissionsOf) {
			context.channel.permissionsOf = () => new Permission(Permissions.all);
		}

		// another hack to get tags working in dm's
		if (!context.channel.guild) {
			context.channel.guild = context.guild;
		}
		if (!member) {
			member = rawCtx.member || await settings.findUser(user.id, {
				memberOnly: true,
			});

			if (!member) {
				return;
			}
		}

		const outMsg = await command.execute({
			...context,
			type: 0,
			author: user,
			member,
			lang: settings.lang,
			prefix: settings.prefix,
			displayPrefix: settings.prefix,
			content: `${settings.prefix}${label} ${args.join(' ')}`.trim(),
			timestamp: msg.timestamp || Date.now(),
		}, args, {
			tag: true,
			settings,
		});

		if (returnId && outMsg instanceof Message) {
			return outMsg.id;
		}
	},
	info: {
		name: `${rawCtx.settings.prefix}${command.displayName}`,
		description: `Tag wrapper for "${rawCtx.settings.prefix}${command.displayName}": ${command.getInfo(rawCtx.settings.lang).description}`,
		dependencies: ['guild', 'channel', 'user'],
		examples: [{
			input: `{${rawCtx.settings.prefix}${command.displayName.split(' ').join(';')}}`,
			output: '',
			note: `The "${rawCtx.settings.prefix}${command.displayName}" command would run and output in a separate message.`,
		}],
		command,
	},
});
