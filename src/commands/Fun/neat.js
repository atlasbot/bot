// const Command = require('../../structures/Command.js');
// const Reddit = require('../../scraper/index.js');
// // const util = require('util');

// module.exports = class Neat extends Command {
// 	constructor(Atlas) {
// 		super(Atlas, module.exports.info);


// 		this.reddit = new Reddit([
// 			'interestingasfuck',
// 		]);
// 	}

// 	async action(msg, args, { // eslint-disable-line no-unused-vars
// 		settings, // eslint-disable-line no-unused-vars
// 	}) {
// 		const responder = new this.Atlas.structs.Responder(msg);

// 		const d = await this.reddit.getImage(msg.author.id);

// 		return responder.embed(d.embed).send();
// 	}
// };

// module.exports.info = {
// 	name: 'neat',
// 	description: 'info.neat.description',
// 	aliases: [
// 		'interestingasfuck',
// 		'iaf',
// 	],
// };
