// from https://github.com/abalabahaha/eris/blob/e6208fa8ab49d526df5276620ac21eb351da3954/lib/structures/Message.js#L147

module.exports = (msg, args) => {
	let clean = args.join(' ').replace(/<(:\w+:)[0-9]+>/g, '$1');

	let authorName = msg.author.username;
	if (msg.channel.guild) {
		const member = msg.channel.guild.members.get(msg.author.id);
		if (member && member.nick) {
			authorName = member.nick;
		}
	}
	clean = clean.replace(new RegExp(`<@!?${msg.author.id}>`, 'g'), `@${authorName}`);

	if (msg.mentions) {
		msg.mentions.forEach((mention) => {
			if (msg.channel.guild) {
				const member = msg.channel.guild.members.get(mention.id);
				if (member && member.nick) {
					clean = clean.replace(new RegExp(`<@!?${mention.id}>`, 'g'), `@${member.nick}`);
				}
			}
			clean = clean.replace(new RegExp(`<@!?${mention.id}>`, 'g'), `@${mention.username}`);
		});
	}

	if (msg.channel.guild && msg.roleMentions) {
		for (const roleID of msg.roleMentions) {
			const role = msg.channel.guild.roles.get(roleID);
			const roleName = role ? role.name : 'deleted-role';
			clean = clean.replace(new RegExp(`<@&${roleID}>`, 'g'), `@${roleName}`);
		}
	}

	msg.channelMentions.forEach((id) => {
		const channel = msg._client.getChannel(id);
		if (channel && channel.name && channel.mention) {
			clean = clean.replace(channel.mention, `#${channel.name}`);
		}
	});

	return clean.replace(/@everyone/g, '@\u200beveryone').replace(/@here/g, '@\u200bhere').split(/ +/g);
};
