const KNOWN_PROVIDERS = {
  // Google
  'gmail.com':            'imap.gmail.com',
  'googlemail.com':       'imap.gmail.com',

  // Microsoft
  'outlook.com':          'outlook.office365.com',
  'outlook.com.br':       'outlook.office365.com',
  'outlook.pt':           'outlook.office365.com',
  'hotmail.com':          'outlook.office365.com',
  'hotmail.com.br':       'outlook.office365.com',
  'hotmail.pt':           'outlook.office365.com',
  'live.com':             'outlook.office365.com',
  'live.com.br':          'outlook.office365.com',
  'live.com.pt':          'outlook.office365.com',
  'msn.com':              'outlook.office365.com',

  // Yahoo
  'yahoo.com':            'imap.mail.yahoo.com',
  'yahoo.com.br':         'imap.mail.yahoo.com',
  'yahoo.pt':             'imap.mail.yahoo.com',
  'yahoo.co.uk':          'imap.mail.yahoo.com',
  'yahoo.fr':             'imap.mail.yahoo.com',
  'yahoo.de':             'imap.mail.yahoo.com',
  'yahoo.es':             'imap.mail.yahoo.com',
  'yahoo.it':             'imap.mail.yahoo.com',
  'yahoo.co.jp':          'imap.mail.yahoo.com',

  // Yandex
  'yandex.ru':            'imap.yandex.ru',
  'yandex.com':           'imap.yandex.com',

  // Apple
  'icloud.com':           'imap.mail.me.com',
  'me.com':               'imap.mail.me.com',
  'mac.com':              'imap.mail.me.com',

  // Proton
  'protonmail.com':       '127.0.0.1',
  'proton.me':            '127.0.0.1',
  'pm.me':                '127.0.0.1',

  // Brazil
  'bol.com.br':           'imap.bol.com.br',
  'uol.com.br':           'imap.uol.com.br',
  'terra.com.br':         'imap.terra.com.br',
  'ig.com.br':            'imap.ig.com.br',

  // Common hosting / ISP
  'aol.com':              'imap.aol.com',
  'zoho.com':             'imap.zoho.com',
  'zoho.eu':              'imap.zoho.eu',
  'mail.com':             'imap.mail.com',
  'gmx.com':              'imap.gmx.com',
  'gmx.net':              'imap.gmx.net',
  'fastmail.com':         'imap.fastmail.com',
  'protonmail.ch':        '127.0.0.1',
  'tutanota.com':         'imap.tutanota.de',
  'tuta.io':              'imap.tutanota.de',
  'onet.pl':              'imap.poczta.onet.pl',
  'wp.pl':                'imap.wp.pl',
  'o2.pl':                'imap.poczta.o2.pl',
  'interia.pl':           'poczta.interia.pl',
  'seznam.cz':            'imap.seznam.cz',
  'email.cz':             'imap.email.cz',
  'libero.it':            'imapmail.libero.it',
  'tiscali.it':           'imap.tiscali.it',
  'gmx.fr':               'imap.gmx.com',
  'gmx.at':               'imap.gmx.com',
  'free.fr':              'imap.free.fr',
  'laposte.net':          'imap.laposte.net',
  'rambler.ru':           'imap.rambler.ru',
  'mail.ru':              'imap.mail.ru',
  'inbox.ru':             'imap.mail.ru',
  'bk.ru':                'imap.mail.ru',
  'list.ru':              'imap.mail.ru',
}

/** Derive a host from an email address. Falls back through imap.<domain> and mail.<domain>. */
function deriveHost(email) {
  const normalized = email.trim().toLowerCase()
  const atIdx = normalized.lastIndexOf('@')
  if (atIdx === -1) throw new Error('Invalid email address')
  const domain = normalized.slice(atIdx + 1)

  if (KNOWN_PROVIDERS[domain]) return KNOWN_PROVIDERS[domain]

  return `imap.${domain}`
}

module.exports = { deriveHost, KNOWN_PROVIDERS }
