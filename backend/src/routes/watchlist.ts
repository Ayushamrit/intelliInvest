import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-development';

const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/', authenticate, async (req: any, res: any) => {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

router.post('/', authenticate, async (req: any, res: any) => {
  try {
    const { ticker } = req.body;
    if (!ticker) return res.status(400).json({ error: 'Ticker is required' });

    const item = await prisma.watchlist.create({
      data: { ticker, userId: req.user.userId }
    });
    res.json(item);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Already in watchlist' });
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

router.delete('/:id', authenticate, async (req: any, res: any) => {
  try {
    await prisma.watchlist.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

export default router;
