// src/services/queue.js
const Bull = require('bull')

const submissionQueue = new Bull('submissions', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})

submissionQueue.on('error', err => {
  console.error('[Queue] Error:', err.message)
})

module.exports = { submissionQueue }
