# Atlas

A Discord bot that does ~~all~~ most of the things - [get-atlas.xyz](https://get-atlas.xyz)

**This is Atlas 8.0, an unfinished version of Atlas**. Source code for pre-8.0 versions will not be made public. The code here isn't finished, and while it should work fine, it's missing a lot of the features the live version has. Slowly they'll be ported over. Contributions are welcome.

## Prerequisites

* Node.js >v10
* MongoDB
* [Lavalink](https://github.com/Frederikam/Lavalink) - not strictly needed but music-related commands won't work at all without it.

## Installation

1. Clone this repo

    ```bash
    git clone https://github.com/get-atlas/bot.git
    ```
2. Run `npm i` to install dependencies

3. Copy `.env.example` to `.env` and fill in the env variables

4. Start the bot with `npm start`

## Environment Variables

| Name          | Description   |
| ------------- | ------------- |
| PREFIXES      | A list of all prefixes the bot will listen for by default, split by commas. @mention will be replaced with the bot's mention. |
| NODE_ENV      | The environment the bot is in, in production some development features will be disabled. |
| TOKEN         | The bot token to login with. |
| DB_USER       | The username of the MongoDB user |
| DB_PASS       | the password for the database. |
| DB_HOST       | The host of the database, something like `127.0.0.1/antares?authSource=admin` |
| LAVALINK_HOST | The IP of the lavalink server to use. |
| LAVALINK_PORT | The WebSocket port for the lavalink server. |
| LAVALINK_PASS | The password for the lavalink server. |
| OMDBAPI_KEY   | An [OMDBAPI](http://omdbapi.com/apikey.aspx) key. |
| VERBOSE       | Whether or not to use verbose logging (e.g, logging commands) - you'll probably want this disabled in a production environment. |
| OWNER         | The bot owner, gives them access to special features like the "eval" command. |
| DISCORDBOTS_ORG_TOKEN | A [discordbots.org](https://discordbots.org/) API Token, used to post statistics to and get information about other bots.

## Known Issues

* Autoreload doesn't properly shut down Agenda.
* everything

## Disclaimer / Warning

I don't know anything, and I can almost guarantee that there are things that could have been done significantly better or faster. I do this for fun as a hobby, so I'm not guaranteeing quality or anything really. I try to do things as best I can, but sometimes I mess up. If you find issues, point them out.

Additionally, this is a very early version of 8.0.0 - there *will* be major breaking changes between now and the release. Be warned!

## Acknowledgements

* src/util/parseTime - from [Aetheryx/remindme](https://github.com/Aetheryx/remindme/blob/master/src/utils/parseTime.js), licensed under MIT