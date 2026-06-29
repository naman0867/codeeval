// src/routes/problems.js
const router = require('express').Router()
const { prisma } = require('../services/db')
const { authenticate, requireRole } = require('../middleware/auth')

// GET /api/problems
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { difficulty } = req.query
    const where = req.user.role === 'CANDIDATE' ? { isPublic: true } : {}
    if (difficulty) where.difficulty = difficulty.toUpperCase()

    const problems = await prisma.problem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true,
        difficulty: true, timeLimit: true, memoryLimit: true,
        isPublic: true, createdAt: true,
        _count: { select: { submissions: true } },
      },
    })
    res.json(problems)
  } catch (err) { next(err) }
})

// GET /api/problems/:slug
router.get('/:slug', authenticate, async (req, res, next) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { slug: req.params.slug },
      include: {
        testCases: {
          where: req.user.role === 'CANDIDATE' ? { isHidden: false } : {},
          orderBy: { order: 'asc' },
        },
        starterCode: true,
      },
    })
    if (!problem) return res.status(404).json({ error: 'Problem not found' })
    if (!problem.isPublic && req.user.role === 'CANDIDATE') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    res.json(problem)
  } catch (err) { next(err) }
})

// POST /api/problems
router.post('/', authenticate, requireRole(['ADMIN', 'INTERVIEWER']), async (req, res, next) => {
  try {
    const { title, slug, description, difficulty, timeLimit, memoryLimit, isPublic, testCases, starterCode } = req.body
    const problem = await prisma.problem.create({
      data: {
        title, slug, description,
        difficulty: difficulty || 'MEDIUM',
        timeLimit: timeLimit || 2000,
        memoryLimit: memoryLimit || 256,
        isPublic: isPublic || false,
        testCases: { create: testCases || [] },
        starterCode: { create: starterCode || [] },
      },
      include: { testCases: true, starterCode: true },
    })
    res.status(201).json(problem)
  } catch (err) { next(err) }
})

// PUT /api/problems/:id
router.put('/:id', authenticate, requireRole(['ADMIN', 'INTERVIEWER']), async (req, res, next) => {
  try {
    const { title, slug, description, difficulty, timeLimit, memoryLimit, isPublic, testCases, starterCode } = req.body

    // Delete existing test cases and starter code, then recreate
    await prisma.testCase.deleteMany({ where: { problemId: req.params.id } })
    await prisma.starterCode.deleteMany({ where: { problemId: req.params.id } })

    const problem = await prisma.problem.update({
      where: { id: req.params.id },
      data: {
        title, slug, description, difficulty,
        timeLimit: parseInt(timeLimit),
        memoryLimit: parseInt(memoryLimit),
        isPublic,
        testCases: { create: testCases || [] },
        starterCode: { create: starterCode || [] },
      },
      include: { testCases: true, starterCode: true },
    })
    res.json(problem)
  } catch (err) { next(err) }
})

// DELETE /api/problems/:id
router.delete('/:id', authenticate, requireRole(['ADMIN', 'INTERVIEWER']), async (req, res, next) => {
  try {
    await prisma.problem.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
