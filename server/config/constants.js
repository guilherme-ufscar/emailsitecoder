module.exports = {
  DEFAULT_MAIL_HOST: process.env.DEFAULT_MAIL_HOST || '186.48.20.18',
  IMAP_CANDIDATES: [
    { port: 993, tls: true },
    { port: 143, tls: false, starttls: true },
    { port: 143, tls: false },
  ],
  SMTP_CANDIDATES: [
    { port: 465, secure: true },
    { port: 587, secure: false },
    { port: 25,  secure: false },
  ],
  PORT_DETECT_TIMEOUT: 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  DB_PATH: process.env.DB_PATH || './humble-falcon.sqlite',
}
