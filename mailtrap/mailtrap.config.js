const { MailtrapClient } = require("mailtrap");
require("dotenv").config();

// dotenv configuration
// MAILTRAP_TOKEN
// MAILTRAP_EMAIL
// MAILTRAP_NAME

const TOKEN = process.env.MAILTRAP_TOKEN;

const mailtrapClient = new MailtrapClient({ token: TOKEN });

const sender = {
  email: process.env.MAILTRAP_EMAIL || "hello@demomailtrap.co",
  name: process.env.MAILTRAP_NAME || "Demo Mailtrap",
};

const recipients = [{ email: process.env.MAILTRAP_EMAIL || "recipient@example.com" }];

module.exports = {
  mailtrapClient,
  sender,
  recipients,
};
