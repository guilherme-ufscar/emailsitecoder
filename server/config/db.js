const Database = require('better-sqlite3')
const path = require('path')
const { DB_PATH } = require('./constants')
const runMigrations = require('../db/migrations')

let db

function getDb() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    runMigrations(db)
  }
  return db
}

module.exports = { getDb }
