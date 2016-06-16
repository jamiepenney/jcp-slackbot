var winston = require('winston');
var config = require('./config');

winston.level = config.logging.level;

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: config.logging.file })
  ]
});

function error(message, metadata){
  logger.error(message, metadata);
}

function warn(message, metadata){
  logger.warn(message, metadata);
}

function info(message, metadata){
  logger.info(message, metadata);
}

function verbose(message, metadata){
  logger.verbose(message, metadata);
}

function debug(message, metadata){
  logger.debug(message, metadata);
}

function silly(message, metadata){
  logger.silly(message, metadata);
}

function log(message, metadata) {
  logger.info(message, metadata); // default info level
};

module.exports = {
  log: log,
  error: error,
  warn: warn,
  info: info,
  verbose: verbose,
  debug: debug,
  silly: silly
};