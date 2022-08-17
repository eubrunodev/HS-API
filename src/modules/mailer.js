const path = require("path")
const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');

require('dotenv').config()

const host = process.env.MAILER_HOST;
const port = process.env.MAILER_PORT;
const user = process.env.MAILER_USER;
const pass = process.env.MAILER_PASS;

var transport = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass
    }
});

transport.use('compile', hbs({
  viewEngine: { 
      defaultLayout: undefined,
      partialsDir: path.resolve('./src/resources/mail/')
  },
  viewPath: path.resolve('./src/resources/mail'),
  extName: '.html',
}));

module.exports = transport;