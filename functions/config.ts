export default {
  location: process.env.LOCATION,
  mailCollection: process.env.MAIL_COLLECTION,
  smtpConnectionUri: process.env.SMTP_CONNECTION_URI,
  defaultFrom: process.env.DEFAULT_FROM,
  defaultReplyTo: process.env.DEFAULT_REPLY_TO,
  usersCollection: process.env.USERS_COLLECTION,
  templatesCollection: process.env.TEMPLATES_COLLECTION,
  testing: process.env.TESTING === 'true',
}
