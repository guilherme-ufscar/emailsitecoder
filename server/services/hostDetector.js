const KNOWN_PROVIDERS = {
  // Google
  'gmail.com':      ['imap.gmail.com',       'smtp.gmail.com'],
  'googlemail.com': ['imap.gmail.com',       'smtp.gmail.com'],

  // Microsoft (same host for both)
  'outlook.com':    ['outlook.office365.com', 'smtp.office365.com'],
  'outlook.com.br': ['outlook.office365.com', 'smtp.office365.com'],
  'outlook.pt':     ['outlook.office365.com', 'smtp.office365.com'],
  'hotmail.com':    ['outlook.office365.com', 'smtp.office365.com'],
  'hotmail.com.br': ['outlook.office365.com', 'smtp.office365.com'],
  'hotmail.pt':     ['outlook.office365.com', 'smtp.office365.com'],
  'live.com':       ['outlook.office365.com', 'smtp.office365.com'],
  'live.com.br':    ['outlook.office365.com', 'smtp.office365.com'],
  'live.com.pt':    ['outlook.office365.com', 'smtp.office365.com'],
  'msn.com':        ['outlook.office365.com', 'smtp.office365.com'],

  // Yahoo
  'yahoo.com':      ['imap.mail.yahoo.com',   'smtp.mail.yahoo.com'],
  'yahoo.com.br':   ['imap.mail.yahoo.com',   'smtp.mail.yahoo.com'],
  'yahoo.pt':       ['imap.mail.yahoo.com',   'smtp.mail.yahoo.com'],
  'yahoo.co.uk':    ['imap.mail.yahoo.com',   'smtp.mail.yahoo.com'],
  'yahoo.fr':       ['imap.mail.yahoo.com',   'smtp.mail.yahoo.com'],
  'yahoo.de':       ['imap.mail.yahoo.com',   'smtp.mail.yahoo.com'],
  'yahoo.es':       ['imap.mail.yahoo.com',   'smtp.mail.yahoo.com'],
  'yahoo.it':       ['imap.mail.yahoo.com',   'smtp.mail.yahoo.com'],
  'yahoo.co.jp':    ['imap.mail.yahoo.com',   'smtp.mail.yahoo.com'],

  // Yandex
  'yandex.ru':      ['imap.yandex.ru',        'smtp.yandex.ru'],
  'yandex.com':     ['imap.yandex.com',       'smtp.yandex.com'],

  // Apple
  'icloud.com':     ['imap.mail.me.com',      'smtp.mail.me.com'],
  'me.com':         ['imap.mail.me.com',      'smtp.mail.me.com'],
  'mac.com':        ['imap.mail.me.com',      'smtp.mail.me.com'],

  // Brazil
  'bol.com.br':     ['imap.bol.com.br',       'smtp.bol.com.br'],
  'uol.com.br':     ['imap.uol.com.br',       'smtp.uol.com.br'],
  'terra.com.br':   ['imap.terra.com.br',     'smtp.terra.com.br'],
  'ig.com.br':      ['imap.ig.com.br',        'smtp.ig.com.br'],

  // Common hosting / ISP
  'aol.com':        ['imap.aol.com',          'smtp.aol.com'],
  'zoho.com':       ['imap.zoho.com',         'smtp.zoho.com'],
  'zoho.eu':        ['imap.zoho.eu',          'smtp.zoho.eu'],
  'mail.com':       ['imap.mail.com',         'smtp.mail.com'],
  'gmx.com':        ['imap.gmx.com',          'mail.gmx.com'],
  'gmx.net':        ['imap.gmx.net',          'mail.gmx.net'],
  'fastmail.com':   ['imap.fastmail.com',     'smtp.fastmail.com'],
  'gmx.fr':         ['imap.gmx.com',          'mail.gmx.com'],
  'gmx.at':         ['imap.gmx.com',          'mail.gmx.com'],
  'free.fr':        ['imap.free.fr',          'smtp.free.fr'],
  'laposte.net':    ['imap.laposte.net',      'smtp.laposte.net'],
  'rambler.ru':     ['imap.rambler.ru',       'smtp.rambler.ru'],
  'mail.ru':        ['imap.mail.ru',          'smtp.mail.ru'],
  'inbox.ru':       ['imap.mail.ru',          'smtp.mail.ru'],
  'bk.ru':          ['imap.mail.ru',          'smtp.mail.ru'],
  'list.ru':        ['imap.mail.ru',          'smtp.mail.ru'],
  'onet.pl':        ['imap.poczta.onet.pl',   'smtp.poczta.onet.pl'],
  'wp.pl':          ['imap.wp.pl',            'smtp.wp.pl'],
  'o2.pl':          ['imap.poczta.o2.pl',     'smtp.poczta.o2.pl'],
  'interia.pl':     ['poczta.interia.pl',     'poczta.interia.pl'],
  'seznam.cz':      ['imap.seznam.cz',        'smtp.seznam.cz'],
  'email.cz':       ['imap.email.cz',         'smtp.email.cz'],
  'libero.it':      ['imapmail.libero.it',    'mail.libero.it'],
  'tiscali.it':     ['imap.tiscali.it',       'smtp.tiscali.it'],
}

function deriveHost(email) {
  const normalized = email.trim().toLowerCase()
  const atIdx = normalized.lastIndexOf('@')
  if (atIdx === -1) throw new Error('Invalid email address')
  const domain = normalized.slice(atIdx + 1)

  if (KNOWN_PROVIDERS[domain]) {
    const [imap, smtp] = KNOWN_PROVIDERS[domain]
    return { imapHost: imap, smtpHost: smtp }
  }

  return { imapHost: `imap.${domain}`, smtpHost: `smtp.${domain}` }
}

module.exports = { deriveHost, KNOWN_PROVIDERS }
