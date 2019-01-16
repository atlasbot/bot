const assert = require('assert');
const path = require('path');
const fs = require('fs');

const loader = require('../src/commands');

const raw = loader.load(false);

const loaded = raw.commands.map(f => ({
	loc: f,
	dirname: path.basename(path.dirname(f)),
	diskname: path.basename(f).split('.').shift(),
	content: fs.readFileSync(f, 'utf8'),
	command: require(f),
}));

// todo: this doesn't handle subcommands properly

describe('Command tests', () => {
	for (const cmd of loaded) {
		describe(`${cmd.dirname}/${cmd.diskname}`, () => {
			it('Should have "guildOnly" set properly', () => {
				const expected = cmd.content.includes('msg.guild');

				if (expected && !cmd.command.info.optionalGuild) {
					assert.equal(cmd.command.info.guildOnly, true);
				}
			});

			// ignore subcommands
			if (cmd.diskname !== 'index') {
			// some services only grab the file name instead of loading the command to grab it's name
				it('should have a filename matching it\'s actual name', () => {
					assert.equal(cmd.diskname, cmd.command.info.name);
				});
			}
		});
	}
});
