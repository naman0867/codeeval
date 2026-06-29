// src/routes/sessions.js
const router = require('express').Router()
const { prisma } = require('../services/db')
const { authenticate, requireRole } = require('../middleware/auth')

// POST /api/sessions — create interview session
router.post('/', authenticate, requireRole(['ADMIN', 'INTERVIEWER']), async (req, res, next) => {
  try {
    const { candidateEmail, candidateName, problemId, scheduledAt, duration } = req.body

    // Find or create candidate user
    let candidate = await prisma.user.findUnique({ where: { email: candidateEmail } })
    if (!candidate) {
      const bcrypt = require('bcryptjs')
      candidate = await prisma.user.create({
        data: {
          email: candidateEmail,
          name: candidateName || candidateEmail.split('@')[0],
          passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
          role: 'CANDIDATE',
        },
      })
    }

    const session = await prisma.interviewSession.create({
      data: {
        candidateId: candidate.id,
        interviewerId: req.user.id,
        problemId,
        duration: duration || 60,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: {
        candidate: { select: { name: true, email: true } },
        problem: { select: { title: true, slug: true } },
      },
    })
    res.status(201).json(session)
  } catch (err) { next(err) }
})

// GET /api/sessions — list sessions
router.get('/', authenticate, async (req, res, next) => {
  try {
    const isInterviewer = ['ADMIN', 'INTERVIEWER'].includes(req.user.role)
    const where = isInterviewer ? { interviewerId: req.user.id } : { candidateId: req.user.id }

    const sessions = await prisma.interviewSession.findMany({
      where,
      include: {
        candidate: { select: { name: true, email: true } },
        interviewer: { select: { name: true } },
        problem: { select: { title: true, slug: true, difficulty: true } },
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { verdict: true, score: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(sessions)
  } catch (err) { next(err) }
})

// GET /api/sessions/join/:token — candidate joins via link
router.get('/join/:token', authenticate, async (req, res, next) => {
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { token: req.params.token },
      include: {
        problem: {
          include: {
            testCases: { where: { isHidden: false }, orderBy: { order: 'asc' } },
            starterCode: true,
          },
        },
        interviewer: { select: { name: true } },
      },
    })
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.status === 'CANCELLED') return res.status(410).json({ error: 'Session cancelled' })

    if (session.status === 'SCHEDULED') {
      await prisma.interviewSession.update({
        where: { id: session.id },
        data: { status: 'ACTIVE', startedAt: new Date() },
      })
      session.status = 'ACTIVE'
      session.startedAt = new Date()
    }
    res.json(session)
  } catch (err) { next(err) }
})

// GET /api/sessions/:id — get single session
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: req.params.id },
      include: {
        candidate: { select: { name: true, email: true } },
        interviewer: { select: { name: true } },
        problem: { select: { title: true, slug: true, difficulty: true } },
        submissions: {
          orderBy: { createdAt: 'desc' },
          include: { results: true },
        },
      },
    })
    if (!session) return res.status(404).json({ error: 'Not found' })
    res.json(session)
  } catch (err) { next(err) }
})

// PATCH /api/sessions/:id/end
router.patch('/:id/end', authenticate, requireRole(['ADMIN', 'INTERVIEWER']), async (req, res, next) => {
  try {
    const session = await prisma.interviewSession.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED', endedAt: new Date(), notes: req.body.notes || null },
    })
    res.json(session)
  } catch (err) { next(err) }
})

// PATCH /api/sessions/:id/cancel
router.patch('/:id/cancel', authenticate, requireRole(['ADMIN', 'INTERVIEWER']), async (req, res, next) => {
  try {
    const session = await prisma.interviewSession.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    })
    res.json(session)
  } catch (err) { next(err) }
})

module.exports = router
