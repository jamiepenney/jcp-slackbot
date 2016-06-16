# jcp-slackbot

A slack bot I built for my Slack team

## Requirements:
* nodejs
* a config.js file (example provided in the repo)
* A Slack Bot token
* A Raygun API token (optional)

## Configuration - config.js

Set the Slack Bot token `slackToken` in config.js.

Alternatively you can set everything from the environment variables:

* `SLACK_TOKEN` is the Slack Bot token we should use to post messages.
* `RAYGUN_API_KEY` is your Raygun API key if you want errors sent to Raygun.

## Running
`node bin/www` will start the bot.
