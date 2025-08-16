import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../util/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'yl_session';
const SESSION_COOKIE_SECURE = String(process.env.SESSION_COOKIE_SECURE) === 'true';

const AuthRegisterRequest = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	role: z.enum(['RIDER', 'DRIVER']),
	name: z.string().min(1),
	phone: z.string().min(7),
});

const AuthLoginRequest = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

function setSessionCookie(res: Response, token: string) {
	res.cookie(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		secure: SESSION_COOKIE_SECURE,
		signed: false,
		sameSite: 'lax',
		path: '/',
	});
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
	const token = req.cookies[SESSION_COOKIE_NAME];
	if (!token) return res.status(401).json({ message: 'Unauthorized' });
	try {
		const payload = jwt.verify(token, JWT_SECRET) as any;
		(req as any).user = payload;
		next();
	} catch (_e) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

export const router = Router();

router.post('/register', async (req, res) => {
	const parsed = AuthRegisterRequest.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

	const { email, password, role, name, phone } = parsed.data;
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) return res.status(409).json({ message: 'Email already in use' });

	const passwordHash = await bcrypt.hash(password, 10);
	const user = await prisma.user.create({
		data: {
			email,
			passwordHash,
			role,
			phone,
			name,
			riderProfile: role === 'RIDER' ? { create: {} } : undefined,
			driverProfile: role === 'DRIVER' ? { create: { status: 'OFFLINE' } } : undefined,
		},
	});

	const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, {
		expiresIn: '7d',
	});
	setSessionCookie(res, token);
	res.status(201).json({ id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone });
});

router.post('/login', async (req, res) => {
	const parsed = AuthLoginRequest.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
	const { email, password } = parsed.data;
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) return res.status(401).json({ message: 'Invalid credentials' });
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
	const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
	setSessionCookie(res, token);
	res.json({ id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone });
});

router.post('/logout', (_req, res) => {
	res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
	res.status(204).end();
});

router.get('/me', authMiddleware, async (req, res) => {
	const userId = (req as any).user.id as string;
	const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true, name: true, phone: true } });
	if (!user) return res.status(404).json({ message: 'Not found' });
	res.json(user);
});

export { authMiddleware };