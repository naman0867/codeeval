// src/index.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const { logger } = require('./services/logger')
const authRoutes = require('./routes/auth')
const problemRoutes = require('./routes/problems')
const submissionRoutes = require('./routes/submissions')
const sessionRoutes = require('./routes/sessions')
const aiRoutes = require('./routes/ai')
const { startWorker } = require('./workers/executionWorker')

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.json({ limit: '50kb' }))
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }))

app.use('/api/auth', authRoutes)
app.use('/api/problems', problemRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/ai', aiRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }))

app.use((err, req, res, next) => {
  logger.error(err.stack)
  const status = err.status || 500
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

app.listen(PORT, () => {
  logger.info(`API server running on port ${PORT}`)
  startWorker()
})
