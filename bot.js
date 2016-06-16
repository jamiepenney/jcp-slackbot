// npm modules
var SlackClient = require('slack-client');
var config = require('./config')
var request = require('request');
var Promise = require('bluebird');

// internal modules
var logger = require('./logger');
var server = require('./webserver');
var stocks = require('./conversations/stocks');

var slack = new SlackClient.WebClient(config.slackToken);

var botUserId;

var slackInfo = Promise.promisify(slack.users.info, {
  context: slack.users
});
var users = [];

function getUser(userId){
  if(users[userId]) {
    return Promise.resolve(users[userId]);
  }

  return slackInfo(userId).then(function(user){
    if(user.ok) {
      users[userId] = user.user;
    }
    return user ? user.user : null;
  });
}

function randomResponse(responses){
  return responses[Math.floor(Math.random() * responses.length)];
}

var Botkit = require('botkit');
var controller = Botkit.slackbot();
var bot = controller.spawn({
  token: config.slackToken
});

controller.on('slash_command',function(bot,message) {

  // reply to slash command
  bot.replyPublic(message,'Everyone can see the results of this slash command');

});


//////////////////////
/// Stock response ///
//////////////////////

controller.hears(stocks.match, ["direct_message","direct_mention", "mention"], function(bot, message){
  getUser(message.user).then(function(user){
    if(!user){
      return;
    }
    stocks.conversation(bot, user, message);
  });
});

/////////////////////
/// Help response ///
/////////////////////

controller.hears(["help"],["direct_message","direct_mention", "mention"],function(bot,message) {
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    bot.startConversation(message, function(err, conversation){
      conversation.say('Hello ' + (user.profile.real_name || user.name));
      conversation.say('I understand the following commands:');
      conversation.say('`hello`: Says hello to you');
      conversation.say('`stock STK`: Gets stock info');
    });
  });
});


//////////////////////
/// Hello response ///
//////////////////////

controller.hears(["hello", "hi", "hey"],["direct_message","direct_mention", "mention"],function(bot,message) {
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    bot.reply(message, 'Hello ' + (user.profile.real_name || user.name));
  });
});

controller.hears(['.*'], ["direct_message","direct_mention", "mention"], function(bot, message){
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    request('http://catfacts-api.appspot.com/api/facts', function (err, response, body){
      if(err || response.statusCode !== 200) {
        console.log(err || response);
        return;
      }
      var facts = JSON.parse(body);
      if(facts && facts.success){
        bot.startConversation(message, function(err, conversation){
          conversation.say('Hello ' + (user.profile.real_name || user.name));
          conversation.say('Thank you for subscribing to cat facts');
          conversation.say(facts.facts[0]);
        });
      }
    })
  })
});

///////////////
/// Exports ///
///////////////



module.exports = {
  start: function() {
    // Start the real time messaging listener
    bot.startRTM(function(err,bot,payload) {
      if (err) {
        throw new Error('Could not connect to Slack');
      }
      controller.saveTeam(bot.team_info, function() {});
    });

    // receive slash commands
    server.setupWebserver(config.port, function(err,webserver) {
      if (err) {
        throw new Error('Could not connect to Slack');
      }
      server.createWebhookEndpoints(controller, webserver);
    });
  }
};
