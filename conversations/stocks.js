var finance = require('yahoo-finance');
var Table = require('easy-table');

var conversation = function(bot, user, message) {
  var stockSymbol = message.match[1] || message.match[2] || 'XRO.NZ';

  bot.startConversation(message, function(err, conversation){
    finance.snapshot({
      symbol: stockSymbol,
      fields: ['s', 'n', 'd1', 'l1', 'y', 'r', 'j1', 'w1', 'c', 'o', 'w'] // https://github.com/pilwon/node-yahoo-finance/blob/master/lib/fields.js
    }).then(function(stock){
      //console.log(Table.print([stock]));
      if(!stock.name) {
        conversation.say('Couldn\'t get stock information for ' + stockSymbol);
        return;
      }

      var upToday = stock.lastTradePriceOnly > stock.open;
      var noChange = stock.lastTradePriceOnly == stock.open

      var colour = upToday || noChange ? "good" : "danger";
      var message = upToday ? "Up so far today" : noChange ? "No change" : "Down so far today";

      conversation.say({
        'text': 'Here\'s the current data for ' + stock.symbol + ' - ' + stock.name,
        'attachments': [{
          'text': message,
          'color': colour,
          'fields':[
            {
              'title': 'Current price',
              'value': "$" + stock.lastTradePriceOnly.toFixed(2),
              'short': true
            },
            {
              'title': 'Opening price',
              'value': "$" + stock.open.toFixed(2),
              short: true
            }
          ]
        }]
      });
    }).error(function(){
      conversation.say('Couldn\'t get stock information for ' + stockSymbol);
    })
  });
};

module.exports = {
  conversation: conversation,
  match: [/stock (?:([a-zA-Z\-]+)|<[^|]+\|([a-zA-Z\-\.]+))/, "XRO"]
};