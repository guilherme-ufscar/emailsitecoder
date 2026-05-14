const dns = require('dns').promises
const { ImapFlow } = require('imapflow')
const nodemailer = require('nodemailer')
const { IMAP_CANDIDATES, SMTP_CANDIDATES, PORT_DETECT_TIMEOUT } = require('../config/constants')

async function resolveMx(domain) {
  try {
    const addresses = await dns.resolveMx(domain)
    addresses.sort((a, b) => a.priority - b.priority)
    // Return the MX host (strip trailing dot if present)
    return addresses.map(a => a.exchange.replace(/\.$/, ''))
  } catch {
    return []
  }
}

async function probeImap(hosts, user, pass) {
  for (const host of hosts) {
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
        console.log(`IMAP ${host}:${candidate.port}/${candidate.tls ? 'ssl' : 'plain'} OK`)
        return { host, port: candidate.port, secure: candidate.tls ? 1 : 0 }
      } catch {
        // try next
      }
    }
  }
  throw new Error('No working IMAP port found')
}

async function probeSmtp(hosts, user, pass) {
  for (const host of hosts) {
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
        console.log(`SMTP ${host}:${candidate.port}/${candidate.secure ? 'ssl' : 'plain'} OK`)
        return { host, port: candidate.port, secure: candidate.secure ? 1 : 0 }
      } catch {
        // try next
      } finally {
        transport.close()
      }
    }
  }
  throw new Error('No working SMTP port found')
}

async function detectPorts(imapHosts, smtpHosts, user, pass) {
  const [imap, smtp] = await Promise.all([
    probeImap(imapHosts, user, pass),
    probeSmtp(smtpHosts, user, pass),
  ])
  return { imap, smtp }
}

module.exports = { detectPorts, resolveMx }
