var express = require('express'),
    bodyParser = require("body-parser");
var logger = require('./logger');

var setupWebserver = function(port,cb) {

  if (!port) {
    throw new Error("Cannot start webserver without a port");
  }
  if (isNaN(port)) {
    throw new Error("Specified port is not a valid number");
  }

  var webserver = express();
  webserver.use(bodyParser.json());
  webserver.use(bodyParser.urlencoded({ extended: true }));

  var server = webserver.listen(port, function () {
    logger.log('** Starting webserver on port ' + port);
    if (cb) { cb(null, webserver); }
  });


};

var createWebhookEndpoints = function(slack_botkit, webserver) {

  logger.log('** Serving webhook endpoints for Slash commands and outgoing webhooks at: http://MY_HOST:' + slack_botkit.config.port + '/slack/receive');
  webserver.post('/slack/receive',function(req,res) {

    // this is a slash command
    if (req.body.command) {
      var message = {};

      for (var key in req.body) {
        message[key] = req.body[key];
      }

      // let's normalize some of these fields to match the rtm message format
      message.user = message.user_id;
      message.channel = message.channel_id;

      slack_botkit.findTeamById(message.team_id,function(err,team) {
        // FIX THIS
        // this won't work for single team bots because the team info
        // might not be in a db
        if (err || !team) {
          logger.log('Received slash command, but could not load team');
          res.status(400).end();
        } else {
          message.type='slash_command';
          // HEY THERE
          // Slash commands can actually just send back a response
          // and have it displayed privately. That means
          // the callback needs access to the res object
          // to send an optional response.

          res.status(200);

          var bot = slack_botkit.spawn(team);

          bot.team_info = team;
          bot.res = res;

          slack_botkit.receiveMessage(bot,message);

        }
      });

    } else if (req.body.trigger_word) {

      var message = {};

      for (var key in req.body) {
        message[key] = req.body[key];
      }

      // let's normalize some of these fields to match the rtm message format
      message.user = message.user_id;
      message.channel = message.channel_id;

      slack_botkit.findTeamById(message.team_id,function(err,team) {

        // FIX THIS
        // this won't work for single team bots because the team info
        // might not be in a db
        if (err || !team) {
          slack_botkit.log('Received outgoing webhook but could not load team');
          res.status(400).end();
        } else {
          message.type='outgoing_webhook';


          res.status(200);

          var bot = slack_botkit.spawn(team);
          bot.res = res;
          bot.team_info = team;


          slack_botkit.receiveMessage(bot,message);

          // outgoing webhooks are also different. They can simply return
          // a response instead of using the API to reply.  Maybe this is
          // a different type of event!!

        }
      });

    } else {
      res.status(400).end();
    }

  })

  return slack_botkit;
}

module.exports = {
  setupWebserver: setupWebserver,
  createWebhookEndpoints: createWebhookEndpoints
}