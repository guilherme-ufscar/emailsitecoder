const { ImapFlow } = require('imapflow')
const nodemailer = require('nodemailer')
const { IMAP_CANDIDATES, SMTP_CANDIDATES, PORT_DETECT_TIMEOUT } = require('../config/constants')

async function probeImap(host, user, pass) {
  for (const candidate of IMAP_CANDIDATES) {
    const client = new ImapFlow({
      host,
      port: candidate.port,
      secure: candidate.tls,
      auth: { user, pass },
      logger: false,
      connectionTimeout: PORT_DETECT_TIMEOUT,
      greetingTimeout: PORT_DETECT_TIMEOUT,
    })
    try {
      await client.connect()
      await client.logout()
      console.log(`IMAP: ${candidate.port}/${candidate.tls ? 'ssl' : 'plain'}`)
      return { port: candidate.port, secure: candidate.tls ? 1 : 0 }
    } catch {
      // try next
    }
  }
  throw new Error('No working IMAP port found')
}

async function probeSmtp(host, user, pass) {
  for (const candidate of SMTP_CANDIDATES) {
    const transport = nodemailer.createTransport({
      host,
      port: candidate.port,
      secure: candidate.secure,
      auth: { user, pass },
      connectionTimeout: PORT_DETECT_TIMEOUT,
      socketTimeout: PORT_DETECT_TIMEOUT,
      tls: { rejectUnauthorized: false },
    })
    try {
      await transport.verify()
      console.log(`SMTP: ${candidate.port}/${candidate.secure ? 'ssl' : 'plain'}`)
      return { port: candidate.port, secure: candidate.secure ? 1 : 0 }
    } catch {
      // try next
    } finally {
      transport.close()
    }
  }
  throw new Error('No working SMTP port found')
}

async function detectPorts(host, user, pass) {
  const [imap, smtp] = await Promise.all([
    probeImap(host, user, pass),
    probeSmtp(host, user, pass),
  ])
  return { imap, smtp }
}

module.exports = { detectPorts }
