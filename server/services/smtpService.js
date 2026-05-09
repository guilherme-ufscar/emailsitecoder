const nodemailer = require('nodemailer')

async function sendViaSMTP(user, message) {
  const transport = nodemailer.createTransport({
    host: user.smtp_host,
    port: user.smtp_port,
    secure: user.smtp_secure === 1,
    auth: { user: user.email, pass: user._password },
    tls: { rejectUnauthorized: false },
  })
  const info = await transport.sendMail(message)
  transport.close()
  return info
}

module.exports = { sendViaSMTP }
