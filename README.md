# Atlas

<div>
		<img src="https://img.shields.io/github/license/atlasbot/bot.svg" alt="License">
		<!-- for some reason this says "invalid response" even though it was working a few days ago, if anyone wants to fix it pls do -->
		<!-- <img src="https://img.shields.io/github/package-json/v/atlasbot/bot.svg?maxAge=300&label=version" alt="Version"> -->
</div>

<div>
    <a href="https://translate.atlasbot.xyz/">
			<img src="https://d322cqt584bo4o.cloudfront.net/getatlas/localized.svg?maxAge=300" alt="Crowdin Translations">
		</a>
    <a href="https://atlasbot.xyz/support">
			<img src="https://img.shields.io/discord/345177567541723137.svg?maxAge=300" alt="Discord">
		</a>
    <a href="https://hub.docker.com/r/sylver/bot">
			<img src="https://img.shields.io/docker/pulls/sylver/bot.svg?maxAge=300" alt="Docker">
		</a>
</div>

Yet another Discord bot that tries to do everything - [atlasbot.xyz](https://atlasbot.xyz)

This is all the code that runs the bot portion of Atlas. The dashboard, API and other secret sauce will remain closed source for now. Contributions are welcome.

## Prerequisites

- [Docker](https://docker.com/)
- [docker-compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/en/) >=10.0.0 \*

\* Required for development. If you're self-hosting, you can skip these requirements.

## Installation

Linux is recommended, but Docker runs and will work on macOS and Windows too. For development, anything that runs Node.js and Docker will work.

#### Self-hosting

1. Install [Docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/).

1. Clone this repo:

   ```bash
   git clone https://github.com/atlasbot/bot.git
   ```

1. Open a terminal in the cloned folder.

1. Copy `.env.example` to `.env` and fill in the required env variables. See below for what most do. Google is your friend.

1. Start the bot with `docker-compose up -d`. If you did everything right, then congratulations - you now have your own instance of Atlas.

#### Development

1. Install [Docker](https://docs.docker.com/install/), [docker-compose](https://docs.docker.com/compose/install/) and [Node.js](https://nodejs.org/en/).

1. Clone this repo:

   ```bash
   git clone https://github.com/atlasbot/bot.git
   ```

1. Open a terminal in the cloned folder.

1. Run `npm install` to install dependencies.

1. Copy `.env.example` to `.env` and replace any variables you would like. Setting `NODE_ENV` to `development` will enable extra features and help debugging things.

1. Start Lavalink, Redis and Mongo via `docker-compose up -d mongo lavalink redis`.

   If you are using docker-compose to host these services, you can leave the defaults in `.env.example` for those services and it should be gucci.

1. Start the bot with `npm run dev`.

1. Start breaking things. Once you save a file change, the bot will restart with the changes. Do `npm run start` to start the bot without watching files.

## Environment Variables

| Name                     | Description                                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| PREFIXES                 | A list of all prefixes the bot will listen for by default, split by commas. @mention will be replaced with the bot's mention.    |
| DEFAULT_PREFIX           | The default prefix for Atlas to use. (By default, this is "a!")                                                                    |
| NODE_ENV                 | The environment the bot is in, should be "production" or "development".                                                          |
| TOKEN                    | The bot token to login with.                                                                                                     |
| MONGO_URI                | A MongoDB Connection URI.                                                                                                        |
| VERBOSE                  | Whether or not to use verbose logging (e.g, logging commands) - you'll probably want this disabled in a production environment.  |
| OWNER                    | The bot's owner ID. **For security, this should only be set to user ID's that already have direct access to the host server.**   |
| DEFAULT_LANG             | The default language to use for everything. (Valid languages are in [/locales](/locales))                                          |
| LAVALINK_NODES           | An array of Lavalink nodes. See example for more info.                                                                           |
| OMDBAPI_KEY \*           | An [OMDBAPI](http://omdbapi.com/apikey.aspx) key.                                                                                |
| GOOGLE_CX \*             | A Google CX key for custom searches. Google is your friend.                                                                      |
| GOOGLE_KEY \*            | A Google key for custom searches. See above.                                                                                     |
| REDIS_HOST \*            | The host for Redis.                                                                                                              |
| REDIS_PASS \*            | The password for the Redis server.                                                                                                |
| REDIS_PORT \*            | The port for the Redis server.                                                                                                    |
| DBL_KEY \*               | A [discordbots.org](https://discordbots.org/) API Token, used to get information about other bots 🕵                             |
| PATREON_KEY \*           | Used to tell who is a patron and who isn't.                                                                                     |
| LASTFM_KEY \*            | Used to find related songs for autoplay.                                                                                         |
| SPOTIFY_CLIENT_ID \*     | Used to hack spotify support into music.                                                                                         |
| SPOTIFY_CLIENT_SECRET \* | See above.                                                                                                                        |
| DEBUG \*                 | A lot of packages come with debugging enabled via the "debug" variable. Set `DEBUG=*` to get debug messages from all the things. |

_\* Optional, but some features may not work without them._

## Development "Features"

The `NODE_ENV` environment variable must be set to `development` for these to work.

- To run a filter without it being enabled, include `Atlas:forceFilter:filter` with whatever you want to test. E.g, `Atlas:forceFilter:invites discord.gg/AXXBPM7` will trigger the "invites" filter to execute even when it's action type is `0`.

## Disclaimer / Warning

If you're going to self-host Atlas, you won't get help with setting it up. We may refuse to support you with general issues. You are responsible if you break anything. Seriously, if you don't know what you're doing, just use the [public instance](https://atlasbot.xyz).

## Acknowledgements

- src/tagengine - added flavour from [nirewen/tatsuscript](https://github.com/nirewen/tatsuscript), licensed under MIT.
