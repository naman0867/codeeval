// src/routes/ai.js
const router = require('express').Router()
const { authenticate } = require('../middleware/auth')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

// POST /api/ai/chat — proxy Groq API calls
router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { system, messages, max_tokens } = req.body
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: max_tokens || 1024,
        messages: [
          { role: 'system', content: system || 'You are a helpful assistant.' },
          ...messages,
        ],
      }),
    })
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Groq API error' })
    res.json({ text: data.choices?.[0]?.message?.content || '' })
  } catch (err) { next(err) }
})

// POST /api/ai/extract-pdf — extract text from PDF base64
router.post('/extract-pdf', authenticate, async (req, res, next) => {
  try {
    const { base64, filename } = req.body
    if (!base64) return res.status(400).json({ error: 'No PDF data provided' })

    // Use Groq to extract and clean text from PDF content description
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: 'You are a PDF text extractor. The user will provide raw PDF text content. Clean it up, remove artifacts, and return only the meaningful text content in a readable format. Preserve all important information like skills, experience, education, job requirements etc.'
          },
          {
            role: 'user',
            content: `Extract and clean the text from this PDF content (filename: ${filename}):\n\n${atob_safe(base64).slice(0, 8000)}`
          }
        ],
      }),
    })
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Extraction failed' })
    res.json({ text: data.choices?.[0]?.message?.content || '' })
  } catch (err) { next(err) }
})

function atob_safe(base64) {
  try {
    return Buffer.from(base64, 'base64').toString('utf-8')
  } catch {
    return base64
  }
}

module.exports = router
