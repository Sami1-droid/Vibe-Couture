import { z } from 'zod';

export const UserRole = z.enum(['RIDER', 'DRIVER', 'ADMIN']);
export type UserRole = z.infer<typeof UserRole>;

export const Coordinates = z.object({
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof Coordinates>;

export const QuoteRequest = z.object({
	origin: Coordinates,
	destination: Coordinates,
});
export type QuoteRequest = z.infer<typeof QuoteRequest>;

export const QuoteResponse = z.object({
	distanceMeters: z.number(),
	durationSeconds: z.number(),
	fareEstimateCents: z.number(),
});
export type QuoteResponse = z.infer<typeof QuoteResponse>;

export const TripStatus = z.enum([
	'REQUESTED',
	'DRIVER_ASSIGNED',
	'PICKING_UP',
	'IN_PROGRESS',
	'COMPLETED',
	'CANCELLED',
]);
export type TripStatus = z.infer<typeof TripStatus>;

export const CreateTripRequest = QuoteRequest.extend({
	paymentMethodId: z.string().optional(),
});
export type CreateTripRequest = z.infer<typeof CreateTripRequest>;

export const Trip = z.object({
	id: z.string(),
	status: TripStatus,
	origin: Coordinates,
	destination: Coordinates,
	driverId: z.string().nullable(),
	riderId: z.string(),
	fareEstimateCents: z.number(),
	createdAt: z.string(),
});
export type Trip = z.infer<typeof Trip>;

export const DriverStatus = z.enum(['OFFLINE', 'ONLINE', 'BUSY']);
export type DriverStatus = z.infer<typeof DriverStatus>;

export const DriverLocationUpdate = z.object({
	lat: z.number(),
	lng: z.number(),
	heading: z.number().optional(),
	speedKph: z.number().optional(),
});
export type DriverLocationUpdate = z.infer<typeof DriverLocationUpdate>;

export const PresignUploadResponse = z.object({
	url: z.string(),
	fields: z.record(z.string()),
	bucket: z.string(),
	key: z.string(),
	contentType: z.string(),
	maxSize: z.number().optional(),
	expiresInSeconds: z.number().optional(),
});
export type PresignUploadResponse = z.infer<typeof PresignUploadResponse>;

export const ApiError = z.object({ message: z.string() });
export type ApiError = z.infer<typeof ApiError>;

export const AuthLoginRequest = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});
export type AuthLoginRequest = z.infer<typeof AuthLoginRequest>;

export const AuthRegisterRequest = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	role: UserRole,
	name: z.string().min(1),
	phone: z.string().min(7),
});
export type AuthRegisterRequest = z.infer<typeof AuthRegisterRequest>;

export const MeResponse = z.object({
	id: z.string(),
	email: z.string().email(),
	role: UserRole,
	name: z.string().optional(),
	phone: z.string().optional(),
});
export type MeResponse = z.infer<typeof MeResponse>;

export const TripUpdateEvent = z.object({
	tripId: z.string(),
	status: TripStatus,
	etaSeconds: z.number().optional(),
});
export type TripUpdateEvent = z.infer<typeof TripUpdateEvent>;

export const IncomingRideRequestEvent = z.object({
	tripId: z.string(),
	origin: Coordinates,
	destination: Coordinates,
	fareEstimateCents: z.number(),
	riderName: z.string().optional(),
});
export type IncomingRideRequestEvent = z.infer<typeof IncomingRideRequestEvent>;