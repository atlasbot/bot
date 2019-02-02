const assert = require('assert');
const path = require('path');
const fs = require('fs');

const loader = require('../src/commands');

const locale = {
	commands: require('../locales/source/commands.json'),
	general: require('../locales/source/general.json'),
	info: require('../locales/source/info.json'),
};

const raw = loader.load(false);

const loaded = raw.commands.map(f => ({
	loc: f,
	dirname: path.basename(path.dirname(f)),
	diskname: path.basename(f).split('.').shift(),
	content: fs.readFileSync(f, 'utf8'),
	command: require(f),
}));

// TODO: this doesn't handle subcommands properly

describe('Command tests', () => {
	for (const cmd of loaded) {
		describe(`${cmd.dirname}/${cmd.diskname}`, () => {
			it('Should have "guildOnly" set properly', () => {
				const expected = cmd.content.includes('msg.guild');

				if (expected && !cmd.command.info.optionalGuild) {
					assert.equal(cmd.command.info.guildOnly, true);
				}
			});

			// TODO: check for embedLinks perms and if the command actually embeds things

			// ignore subcommands
			if (cmd.diskname !== 'index') {
			// some services only grab the file name instead of loading the command to grab it's name
				it('should have a filename matching it\'s actual name', () => {
					assert.equal(cmd.diskname, cmd.command.info.name);
				});
			}

			const cmdLocale = locale.info[cmd.diskname] || (() => {
				if (locale.info[cmd.dirname]) {
					return locale.info[cmd.dirname][cmd.diskname] || locale.info[cmd.dirname].base;
				}
			})();

			if (cmdLocale) {
				it('Has examples when required', () => {
					if (cmdLocale.usage && (!cmd.command.info.examples || !cmd.command.info.examples.length)) {
						assert.fail('Usage without examples is a no-no');
					}
				});
			}
		});
	}
});
