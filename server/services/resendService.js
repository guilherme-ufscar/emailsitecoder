const { Resend } = require('resend')
const { sendViaSMTP } = require('./smtpService')
const { appendToSent } = require('./imapService')

async function sendEmail(user, message) {
  let method = 'smtp'
  let messageId

  if (user.resend_api_key) {
    try {
      const resend = new Resend(user.resend_api_key)
      const result = await resend.emails.send({
        from: message.from || user.email,
        to: Array.isArray(message.to) ? message.to : [message.to],
        cc: message.cc,
        bcc: message.bcc,
        subject: message.subject,
        html: message.html,
        text: message.text,
        attachments: message.attachments,
      })
      method = 'resend'
      messageId = result.id
    } catch (err) {
      console.log('Resend failed, falling back to SMTP:', err.message)
    }
  }

  if (method === 'smtp') {
    const info = await sendViaSMTP(user, message)
    messageId = info.messageId
  }

  // Append to IMAP Sent folder (best effort)
  if (message.raw) {
    appendToSent(user, message.raw).catch(() => {})
  }

  return { method, messageId }
}

module.exports = { sendEmail }
