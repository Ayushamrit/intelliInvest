import express from 'express';
import jwt from 'jsonwebtoken';
import { investmentAgent } from '../agent/graph';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-development';

// Middleware to authenticate
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

router.post('/', authenticate, async (req: any, res: any) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    console.log(`\n🔍 Starting research for: "${companyName}"`);

    const initialState = {
      companyName,
      researchData: '',
      analysis: '',
      decision: '',
      reasoning: ''
    };

    const finalState = await investmentAgent.invoke(initialState);

    console.log(`✅ Research complete. Decision: ${finalState.decision}`);

    // Save report to database
    await prisma.report.create({
      data: {
        companyName,
        decision: finalState.decision,
        reasoning: finalState.reasoning,
        userId: req.user.userId,
      },
    });

    res.json({
      decision: finalState.decision,
      reasoning: finalState.reasoning,
      analysis: finalState.analysis
    });

  } catch (error: any) {
    // Log the FULL error to the server console for debugging
    console.error('\n❌ RESEARCH ERROR DETAILS:');
    console.error('Message:', error?.message);
    console.error('Stack:', error?.stack);
    console.error('Full error:', JSON.stringify(error, null, 2));

    // Return detailed error to client in development
    res.status(500).json({
      error: 'Failed to complete research.',
      details: error?.message || String(error),
    });
  }
});

export default router;
