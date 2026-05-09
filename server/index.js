require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const fs = require('fs')
const { UPLOAD_DIR } = require('./config/constants')
const { getDb } = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// Init DB (runs migrations)
getDb()

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })

app.use('/api/auth', authLimiter, require('./routes/auth'))
app.use('/api/mail', require('./routes/mail'))
app.use('/api/compose', require('./routes/compose'))
app.use('/api/attachments', require('./routes/attachments'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/todos', require('./routes/todos'))
app.use('/api/calendar', require('./routes/calendar'))
app.use('/api/kanban', require('./routes/kanban'))
app.use('/api/notes', require('./routes/notes'))
app.use('/api/contacts', require('./routes/contacts'))
app.use('/api/templates', require('./routes/templates'))

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Humble Falcon server running on port ${PORT}`))
