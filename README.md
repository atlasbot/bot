# Atlas

A Discord bot that does ~~all~~ most of the things - [get-atlas.xyz](https://get-atlas.xyz)

**This is Atlas 8.0, an unfinished version of Atlas**. Source code for pre-8.0 versions will not be made public. The code here isn't finished, and while it should work fine, it's missing a lot of the features the live version has. Slowly they'll be ported over. Contributions are welcome.

## Prerequisites

* Node.js >v10
* MongoDB 
* [Lavalink](https://github.com/Frederikam/Lavalink) 

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
| NODE_ENV      | The environment the bot is in, should be "production" or "development". |
| TOKEN         | The bot token to login with. |
| DB_USER       | The username of the MongoDB user |
| DB_PASS       | the password for the database. |
| DB_HOST       | The host of the database, something like `127.0.0.1/antares?authSource=admin` |
| LAVALINK_HOST | The IP of the lavalink server to use. |
| LAVALINK_PORT | The WebSocket port for the lavalink server. |
| LAVALINK_PASS | The password for the lavalink server. |
| OMDBAPI_KEY   | An [OMDBAPI](http://omdbapi.com/apikey.aspx) key. |
| VERBOSE       | Whether or not to use verbose logging (e.g, logging commands) - you'll probably want this disabled in a production environment. |
| OWNER         | The bot's owner ID. **For security, this should only be set to user ID's that already have direct access to the host server.**|
| DISCORDBOTS_ORG_TOKEN | A [discordbots.org](https://discordbots.org/) API Token, used to post statistics to and get information about other bots. |
| GOOGLE_CX | A Google CX key for custom searches. Google is your friend. |
| GOOGLE_KEY | A Google key for custom searches. See above.

## Disclaimer / Warning

I don't know anything, and I can almost guarantee that there are things that could have been done significantly better or faster. I do this for fun as a hobby, so I'm not guaranteeing quality or anything really. I try to do things as best I can, but sometimes I mess up. If you find issues, point them out.

Additionally, this is a very early version of 8.0 - there *will* be major breaking changes between now and the release. Be warned!

## Acknowledgements

* lib/utils/parseTime - from [Aetheryx/remindme](https://github.com/Aetheryx/remindme/blob/edb8d301c633379e7fa3d4141226143cc3358906/src/utils/parseTime.js#L1), licensed under MIT.
* lib/utils/cleanArgs - from [abalabahaha/eris](https://github.com/abalabahaha/eris/blob/e6208fa8ab49d526df5276620ac21eb351da3954/lib/structures/Message.js#L147), licensed under MIT.
