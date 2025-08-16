import { Router } from 'express';
import { router as auth } from './auth.js';
import { router as quotes } from './quotes.js';
import { router as trips } from './trips.js';
import { router as uploads } from './uploads.js';
import { router as payments } from './payments.js';

export const router = Router();
router.use('/auth', auth);
router.use('/quotes', quotes);
router.use('/trips', trips);
router.use('/uploads', uploads);
router.use('/payments', payments);