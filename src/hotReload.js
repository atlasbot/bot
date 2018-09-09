const fs = require('fs');
const path = require('path');
const cmdUtil = require('./commands');

/*
* Messy way to reload commands/event listeners when they're changed
* This should really be cleaned up, but it's only in use in
* dev environments, so it'll do.
*/

const changed = {};

let Atlas;

// TODO: support new commands being added
const supported = [
	{
		dir: 'commands',
		handle: (eventType, loc, file) => {
			if (file === 'index.js') return;

			const [label] = file.split('/').pop().split('\\')
				.pop()
				.split('.');
			if (file.endsWith('.js')) {
				console.info(`${label} (${file}) changed with event type "${eventType}", reloading command...`);
				let curr = Atlas.commands.labels.get(label);
				const master = Array.from(Atlas.commands.labels.values())
					.find(c => c.info.subcommands && c.info.subcommands.has(label));
				if (master) {
					curr = master.info.subcommands.get(label);
				}
				cmdUtil.setup(Atlas, loc, {
					reload: true,
					master,
					plugin: curr.info.plugin,
					subs: curr.info.subcommands ? Array.from(curr.info.subcommands.values())
						.map(c => c.info.workdir) : [],
				});
			}
		},
	},
	{
		dir: 'events',
		handle: (eventType, loc, file) => {
			console.info(`${file} changed with event type "${eventType}", reloading event...`);
			const listenFor = file.split('.')[0];
			Atlas.client.removeListener(listenFor, Atlas.eventFunctions[listenFor]);

			const Handler = require(loc);
			const handler = new Handler(Atlas);
			Atlas.eventFunctions[listenFor] = handler.execute.bind(handler);
			Atlas.client.on(listenFor, Atlas.eventFunctions[listenFor]);
		},
	}];

module.exports = (bot) => {
	if (!Atlas) {
		Atlas = bot;
	}
	console.warn('Development environment, enabling hot reloads...');
	for (const { dir, handle } of supported) {
		const loc = path.join(__dirname, dir);
		fs.watch(loc, {
			recursive: true,
		}, (eventType, filename) => {
			if (eventType === 'rename' || eventType === 'delete') return;

			const evtLoc = path.join(__dirname, dir, filename);
			if (fs.statSync(evtLoc).isDirectory()) return;

			if (!changed[filename]) {
				changed[filename] = 1;
			} else {
				changed[filename] += 1;
			}
			setTimeout(() => {
				if (changed[filename]) {
					delete changed[filename];
					handle(eventType, evtLoc, filename);
				}
			}, 1000);
		});
	}
};
