import { Router } from 'express';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import crypto from 'crypto';

export const router = Router();

const s3Client = new S3Client({
	region: process.env.S3_REGION,
	endpoint: process.env.S3_ENDPOINT,
	forcePathStyle: String(process.env.S3_FORCE_PATH_STYLE) === 'true',
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
	},
});

router.post('/presign', async (_req, res) => {
	const bucket = process.env.S3_BUCKET as string;
	const key = `uploads/${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
	const contentType = 'image/*';
	const maxSize = 5 * 1024 * 1024; // 5MB
	const expiresIn = 300; // seconds

	const { url, fields } = await createPresignedPost(s3Client, {
		Bucket: bucket,
		Key: key,
		Conditions: [["content-length-range", 1, maxSize], ["starts-with", "$Content-Type", "image/"]],
		Expires: expiresIn,
		Fields: { 'Content-Type': 'image/jpeg' },
	});
	res.json({ url, fields, bucket, key, contentType: 'image/jpeg', maxSize, expiresInSeconds: expiresIn });
});