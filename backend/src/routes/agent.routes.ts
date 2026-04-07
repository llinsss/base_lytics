import { Router } from 'express';
import { body } from 'express-validator';
import { validate, asyncHandler } from '../middleware/error.middleware';
import { runAgent } from '../services/agent.service';

const router = Router();

router.post(
  '/chat',
  validate([
    body('message').isString().notEmpty(),
    body('history').optional().isArray(),
  ]),
  asyncHandler(async (req: any, res: any) => {
    const { message, history = [] } = req.body;
    const reply = await runAgent(message, history);
    res.json({ reply });
  })
);

export default router;
