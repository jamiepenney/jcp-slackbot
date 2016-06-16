var config = {
  slackToken: process.env.SLACK_TOKEN || '',
  slackSecretToken: process.env.SLACK_SECRET_TOKEN || '',
  raygunApiKey: process.env.RAYGUN_API_KEY || '',
  port: process.env.PORT || 8080,
  logging: {
    level: process.env.LOGGING_LEVEL || 'debug',
    file: process.env.LOG_FILE || 'debug.log'
  }
};

module.exports = config;
